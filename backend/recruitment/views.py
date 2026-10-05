from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import JobApplication, ApplicationStatusHistory, Interview, Notification
from jobs.models import Job
from accounts.models import CandidateProfile, Resume, RecruiterProfile, UserProfile
from .serializer import (
    JobApplicationSerializer, ApplicationStatusHistorySerializer,
    InterviewSerializer, NotificationSerializer
)

@api_view(['GET', 'POST'])
@csrf_exempt
def application_list_create(request):
    if request.method == 'GET':
        user_id = request.GET.get('user_id') or (request.user.id if request.user.is_authenticated else None)
        job_id = request.GET.get('job_id')
        role = request.GET.get('role', 'candidate')

        applications = JobApplication.objects.all()

        if job_id:
            applications = applications.filter(job_id=job_id)
        elif user_id:
            user = User.objects.filter(id=user_id).first()
            if user:
                user_prof = UserProfile.objects.filter(user=user).first()
                if user_prof and user_prof.role == 'recruiter':
                    recruiter_prof = RecruiterProfile.objects.filter(user=user).first()
                    if recruiter_prof:
                        recruiter_job_ids = Job.objects.filter(company=recruiter_prof.company).values_list('id', flat=True)
                        applications = applications.filter(job_id__in=recruiter_job_ids)
                    else:
                        applications = applications.filter(job__recruiter__user=user)
                else:
                    candidate_prof = CandidateProfile.objects.filter(user=user).first()
                    if candidate_prof:
                        applications = applications.filter(candidate=candidate_prof)
                    else:
                        applications = JobApplication.objects.none()

        serializer = JobApplicationSerializer(applications, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        user_id = request.data.get('user_id') or (request.user.id if request.user.is_authenticated else None)
        job_id = request.data.get('job_id')
        resume_id = request.data.get('resume_id')
        cover_letter = request.data.get('cover_letter', '')

        if not job_id:
            return Response({'error': 'job_id is required'}, status=400)

        job = Job.objects.filter(id=job_id).first()
        if not job:
            return Response({'error': 'Job not found'}, status=404)

        user = User.objects.filter(id=user_id).first() if user_id else User.objects.first()
        if not user:
            return Response({'error': 'User not found'}, status=404)

        candidate_profile, _ = CandidateProfile.objects.get_or_create(user=user)

        # Check existing application
        existing = JobApplication.objects.filter(job=job, candidate=candidate_profile).first()
        if existing:
            return Response({'error': 'You have already applied for this position', 'application_id': existing.id}, status=400)

        resume_obj = Resume.objects.filter(id=resume_id, candidate=candidate_profile).first() if resume_id else None

        application = JobApplication.objects.create(
            job=job,
            candidate=candidate_profile,
            resume=resume_obj,
            cover_letter=cover_letter,
            status='applied'
        )

        ApplicationStatusHistory.objects.create(
            application=application,
            status='applied',
            changed_by=user,
            comment='Application submitted by candidate'
        )

        # Notification for candidate
        Notification.objects.create(
            user=user,
            title='Application Submitted',
            message=f'Your application for {job.title} at {job.company.name if job.company else "Company"} has been received.'
        )

        return Response(JobApplicationSerializer(application).data, status=201)

@api_view(['GET', 'PATCH', 'PUT', 'DELETE'])
@csrf_exempt
def application_detail_update(request, app_id):
    application = JobApplication.objects.filter(id=app_id).first()
    if not application:
        return Response({'error': 'Application not found'}, status=404)

    if request.method == 'GET':
        return Response(JobApplicationSerializer(application).data)

    elif request.method in ['PATCH', 'PUT']:
        new_status = request.data.get('status')
        comment = request.data.get('comment', '')
        user_id = request.data.get('user_id') or (request.user.id if request.user.is_authenticated else None)
        user = User.objects.filter(id=user_id).first() if user_id else None

        if new_status and new_status != application.status:
            application.status = new_status
            application.save()

            ApplicationStatusHistory.objects.create(
                application=application,
                status=new_status,
                changed_by=user,
                comment=comment or f'Status updated to {new_status}'
            )

            # Notify candidate
            Notification.objects.create(
                user=application.candidate.user,
                title=f'Application Status Updated: {job_status_label(new_status)}',
                message=f'Your application for {application.job.title} is now: {job_status_label(new_status)}.'
            )

        return Response(JobApplicationSerializer(application).data)

    elif request.method == 'DELETE':
        application.delete()
        return Response({'message': 'Application deleted'})

def job_status_label(status):
    labels = {
        'applied': 'Applied',
        'reviewing': 'Under Review',
        'shortlisted': 'Shortlisted',
        'interview': 'Interview Scheduled',
        'selected': 'Selected / Offer Extended',
        'rejected': 'Not Selected',
        'withdrawn': 'Withdrawn',
    }
    return labels.get(status, status)

@api_view(['GET', 'POST'])
@csrf_exempt
def interview_api(request):
    if request.method == 'GET':
        app_id = request.GET.get('application_id')
        interviews = Interview.objects.all()
        if app_id:
            interviews = interviews.filter(application_id=app_id)
        serializer = InterviewSerializer(interviews, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        app_id = request.data.get('application_id')
        application = JobApplication.objects.filter(id=app_id).first()
        if not application:
            return Response({'error': 'Application not found'}, status=404)

        interview = Interview.objects.create(
            application=application,
            interview_type=request.data.get('interview_type', 'online'),
            scheduled_at=request.data.get('scheduled_at'),
            meeting_link=request.data.get('meeting_link', ''),
            location=request.data.get('location', ''),
            notes=request.data.get('notes', '')
        )

        application.status = 'interview'
        application.save()

        Notification.objects.create(
            user=application.candidate.user,
            title='Interview Scheduled!',
            message=f'An interview has been scheduled for {application.job.title} on {request.data.get("scheduled_at")}.'
        )

        return Response(InterviewSerializer(interview).data, status=201)

@api_view(['GET', 'PATCH'])
@csrf_exempt
def notification_api(request, notif_id=None):
    user_id = request.GET.get('user_id') or request.data.get('user_id') or (request.user.id if request.user.is_authenticated else None)
    if not user_id:
        user_id = User.objects.first().id if User.objects.exists() else None

    if request.method == 'GET':
        notifications = Notification.objects.filter(user_id=user_id).order_by('-created_at')
        return Response(NotificationSerializer(notifications, many=True).data)

    elif request.method == 'PATCH':
        if notif_id:
            Notification.objects.filter(id=notif_id, user_id=user_id).update(is_read=True)
        else:
            Notification.objects.filter(user_id=user_id).update(is_read=True)
        return Response({'message': 'Notifications updated'})
