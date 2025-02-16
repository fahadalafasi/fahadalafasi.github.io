// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > lastScroll && currentScroll > 70) {
        navbar.style.transform = 'translateY(-100%)';
    } else {
        navbar.style.transform = 'translateY(0)';
    }
    
    if (currentScroll > 100) {
        navbar.style.background = '#ffffff';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'transparent';
        navbar.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// Animate skill bars when in viewport
const skillLevels = document.querySelectorAll('.skill-level');
const animateSkills = () => {
    skillLevels.forEach(skill => {
        const skillTop = skill.getBoundingClientRect().top;
        if (skillTop < window.innerHeight - 50) {
            skill.style.width = skill.parentElement.getAttribute('data-level') || '80%';
        }
    });
};

window.addEventListener('scroll', animateSkills);

// Initialize EmailJS
(function() {
    emailjs.init("XyXtTUWA9nL6NJK4");
})();

// Add CSRF protection token
function generateCSRFToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Initialize EmailJS with rate limiting
let lastSubmissionTime = 0;
const SUBMISSION_COOLDOWN = 60000; // 1 minute cooldown

// Form submission handling with security measures
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    // Add CSRF token to form
    const csrfToken = generateCSRFToken();
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = '_csrf';
    csrfInput.value = csrfToken;
    contactForm.appendChild(csrfInput);

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Rate limiting check
        const now = Date.now();
        if (now - lastSubmissionTime < SUBMISSION_COOLDOWN) {
            alert('Please wait a moment before sending another message.');
            return;
        }

        // Basic input validation
        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');

        // Input sanitization and validation
        if (!name || !email || !message) {
            alert('Please fill in all fields.');
            return;
        }

        if (name.length > 100 || message.length > 1000) {
            alert('Message or name is too long.');
            return;
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        // Show loading state
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;

        try {
            // Honeypot check (hidden field for bots)
            if (formData.get('website')) {
                throw new Error('Bot detected');
            }

            const templateParams = {
                from_name: name.trim(),
                from_email: email.trim(),
                message: message.trim(),
                to_email: cvConfig.basics.email,
                csrf_token: csrfToken
            };

            // Send email using EmailJS with timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Request timeout')), 10000);
            });

            await Promise.race([
                emailjs.send('service_ussep4a', 'template_r9469yt', templateParams),
                timeoutPromise
            ]);

            // Update last submission time
            lastSubmissionTime = Date.now();

            // Show success message
            alert('Thank you for your message! I will get back to you soon.');
            contactForm.reset();
        } catch (error) {
            console.error('Error:', error);
            alert('Sorry, there was an error sending your message. Please try again.');
        } finally {
            // Reset button state
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });
}

// Protect against common XSS attacks
document.addEventListener('DOMContentLoaded', function() {
    // Disable inline scripts
    document.querySelectorAll('*').forEach(element => {
        element.removeAttribute('onclick');
        element.removeAttribute('onload');
        element.removeAttribute('onmouseover');
        element.removeAttribute('onmouseout');
    });
});

// Add honeypot field
const honeypotField = document.createElement('div');
honeypotField.style.display = 'none';
honeypotField.innerHTML = '<input type="text" name="website" tabindex="-1" autocomplete="off">';
contactForm.appendChild(honeypotField);

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.2
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Update CV content from config
function updateCVContent() {
    // Update basic information
    document.querySelector('.hero h1').textContent = cvConfig.basics.name;
    document.querySelector('.hero h2').textContent = cvConfig.basics.title;
    document.querySelector('.hero p').textContent = cvConfig.basics.description;
    
    // Update social links
    document.querySelector('a[href*="linkedin"]').href = cvConfig.basics.social.linkedin;
    document.querySelector('a[href*="github"]').href = cvConfig.basics.social.github;

    // Update about section
    document.getElementById('about-summary').textContent = cvConfig.about.summary;

    // Update education section
    const educationTimeline = document.querySelector('#education .timeline');
    educationTimeline.innerHTML = cvConfig.education
        .map(edu => `
            <div class="timeline-item">
                <div class="timeline-content">
                    <h3>${edu.degree}</h3>
                    <h4>${edu.school}</h4>
                    <p class="date">${edu.period}</p>
                    <ul>
                        ${edu.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `).join('');

    // Update experience section
    const experienceTimeline = document.querySelector('#experience .timeline');
    experienceTimeline.innerHTML = cvConfig.experience
        .map(exp => `
            <div class="timeline-item">
                <div class="timeline-content">
                    <h3>${exp.title}</h3>
                    <h4>${exp.company}</h4>
                    <p class="date">${exp.period}</p>
                    <ul>
                        ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `).join('');

    // Update skills section
    const technicalSkills = document.querySelector('.skills-grid .skill-category:first-child .skill-items');
    technicalSkills.innerHTML = cvConfig.skills.technical
        .map(skill => `
            <div class="skill-item">
                <span class="skill-name">${skill.name}</span>
                <div class="skill-bar">
                    <div class="skill-level" style="width: ${skill.level}%"></div>
                </div>
            </div>
        `).join('');

    const softSkills = document.querySelector('.skills-grid .skill-category:last-child .skill-items');
    softSkills.innerHTML = cvConfig.skills.soft
        .map(skill => `
            <div class="skill-item">
                <span class="skill-name">${skill.name}</span>
                <div class="skill-bar">
                    <div class="skill-level" style="width: ${skill.level}%"></div>
                </div>
            </div>
        `).join('');

    // Update contact information
    document.querySelector('.contact-item:nth-child(1) span').textContent = cvConfig.basics.email;
    document.querySelector('.contact-item:nth-child(2) span').textContent = cvConfig.basics.phone;
    document.querySelector('.contact-item:nth-child(3) span').textContent = cvConfig.basics.location;

    // Update footer
    document.querySelector('.footer p').textContent = ` ${new Date().getFullYear()} ${cvConfig.basics.name}. All rights reserved.`;
}

// Call the update function when the page loads
document.addEventListener('DOMContentLoaded', updateCVContent);
