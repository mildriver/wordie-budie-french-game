/*
	Wordie Budie - Enhanced JavaScript
	Integrated with HTML5UP Strongly Typed Template
*/

(function() {
	'use strict';

	// DOM Ready
	document.addEventListener('DOMContentLoaded', function() {

		// Enhanced smooth scrolling for anchor links
		const links = document.querySelectorAll('a[href^="#"]');
		links.forEach(link => {
			link.addEventListener('click', function(e) {
				e.preventDefault();
				const target = document.querySelector(this.getAttribute('href'));
				if (target) {
					target.scrollIntoView({
						behavior: 'smooth',
						block: 'start'
					});
				}
			});
		});

		// Add intersection observer for fade-in animations
		const observerOptions = {
			threshold: 0.1,
			rootMargin: '0px 0px -50px 0px'
		};

		const observer = new IntersectionObserver(function(entries) {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.style.opacity = '1';
					entry.target.style.transform = 'translateY(0)';
				}
			});
		}, observerOptions);

		// Observe fade-in elements
		const fadeElements = document.querySelectorAll('.fade-in-up');
		fadeElements.forEach(el => {
			el.style.opacity = '0';
			el.style.transform = 'translateY(30px)';
			el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
			observer.observe(el);
		});

		// Enhanced button interactions
		const buttons = document.querySelectorAll('.button, .play-button');
		buttons.forEach(button => {
			button.addEventListener('mouseenter', function() {
				this.style.transform = 'translateY(-3px)';
			});

			button.addEventListener('mouseleave', function() {
				this.style.transform = 'translateY(0)';
			});

			button.addEventListener('mousedown', function() {
				this.style.transform = 'translateY(-1px)';
			});

			button.addEventListener('mouseup', function() {
				this.style.transform = 'translateY(-3px)';
			});
		});

		// Add ripple effect to buttons
		buttons.forEach(button => {
			button.addEventListener('click', function(e) {
				const ripple = document.createElement('span');
				const rect = this.getBoundingClientRect();
				const size = Math.max(rect.width, rect.height);
				const x = e.clientX - rect.left - size / 2;
				const y = e.clientY - rect.top - size / 2;

				ripple.style.width = ripple.style.height = size + 'px';
				ripple.style.left = x + 'px';
				ripple.style.top = y + 'px';
				ripple.classList.add('ripple');

				this.appendChild(ripple);

				setTimeout(() => {
					ripple.remove();
				}, 600);
			});
		});

		// Enhanced hover effects for feature cards
		const featureCards = document.querySelectorAll('#features section');
		featureCards.forEach(card => {
			card.addEventListener('mouseenter', function() {
				this.style.transform = 'translateY(-8px) scale(1.02)';
				this.style.boxShadow = '0 15px 40px rgba(0,0,0,0.15)';
			});

			card.addEventListener('mouseleave', function() {
				this.style.transform = 'translateY(0) scale(1)';
				this.style.boxShadow = '0 5px 25px rgba(0,0,0,0.08)';
			});
		});

		// Add loading state to navigation links
		const navLinks = document.querySelectorAll('#nav a[href$=".html"]');
		navLinks.forEach(link => {
			link.addEventListener('click', function() {
				this.style.opacity = '0.7';
				this.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Loading...';
			});
		});

		// Parallax effect for header
		let ticking = false;

		function updateParallax() {
			const scrolled = window.pageYOffset;
			const header = document.querySelector('#header');

			if (header) {
				const rate = scrolled * -0.5;
				header.style.transform = `translateY(${rate}px)`;
			}

			ticking = false;
		}

		function requestParallax() {
			if (!ticking) {
				requestAnimationFrame(updateParallax);
				ticking = true;
			}
		}

		window.addEventListener('scroll', requestParallax);

		// Add dynamic typing effect to the subtitle (optional)
		const subtitle = document.querySelector('#header p');
		if (subtitle) {
			const text = subtitle.textContent;
			subtitle.textContent = '';
			subtitle.style.borderRight = '2px solid white';

			let i = 0;
			function typeWriter() {
				if (i < text.length) {
					subtitle.textContent += text.charAt(i);
					i++;
					setTimeout(typeWriter, 50);
				} else {
					setTimeout(() => {
						subtitle.style.borderRight = 'none';
					}, 1000);
				}
			}

			// Start typing after a delay
			setTimeout(typeWriter, 1000);
		}

		// Enhanced form interactions
		const formInputs = document.querySelectorAll('#footer input, #footer textarea');
		formInputs.forEach(input => {
			input.addEventListener('focus', function() {
				this.parentElement.style.transform = 'scale(1.02)';
				this.style.borderColor = '#667eea';
			});

			input.addEventListener('blur', function() {
				this.parentElement.style.transform = 'scale(1)';
				this.style.borderColor = 'rgba(255,255,255,0.2)';
			});
		});

		// Add success message for form submission
		const submitButton = document.querySelector('.form-button-submit');
		if (submitButton) {
			submitButton.addEventListener('click', function(e) {
				e.preventDefault();

				// Simple form validation
				const inputs = document.querySelectorAll('#footer input[required], #footer textarea[required]');
				let isValid = true;

				inputs.forEach(input => {
					if (!input.value.trim()) {
						isValid = false;
						input.style.borderColor = '#f56565';
						setTimeout(() => {
							input.style.borderColor = 'rgba(255,255,255,0.2)';
						}, 3000);
					}
				});

				if (isValid) {
					this.innerHTML = '<i class="fa fa-check"></i> Message Sent!';
					this.style.background = 'linear-gradient(135deg, #51cf66 0%, #40c057 100%)';

					setTimeout(() => {
						this.innerHTML = '<i class="fa fa-envelope"></i> Send Message';
						this.style.background = '';
					}, 3000);
				}
			});
		}

		console.log('🎯 Wordie Budie enhanced JavaScript loaded successfully!');
	});

	// Add CSS for ripple effect
	const style = document.createElement('style');
	style.textContent = `
		.ripple {
			position: absolute;
			border-radius: 50%;
			background: rgba(255, 255, 255, 0.3);
			transform: scale(0);
			animation: ripple-animation 0.6s ease-out;
			pointer-events: none;
		}

		@keyframes ripple-animation {
			to {
				transform: scale(2);
				opacity: 0;
			}
		}
	`;
	document.head.appendChild(style);

})();