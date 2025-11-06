// Form Submission Handler
document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        smsConsent: document.getElementById('smsConsent').checked,
        timestamp: new Date().toISOString()
    };
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Joining...';
    submitBtn.disabled = true;
    
    try {
        // TODO: Replace with your actual backend endpoint
        // For now, we'll simulate a successful submission
        await simulateAPICall(formData);
        
        // Show success modal
        showModal();
        
        // Reset form
        e.target.reset();
        
        // Log to console (for testing - remove in production)
        console.log('Form submitted:', formData);
        
    } catch (error) {
        alert('Something went wrong. Please try again.');
        console.error('Submission error:', error);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Simulate API call (replace with actual backend integration)
function simulateAPICall(data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Store in localStorage for demo purposes
            const subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');
            subscribers.push(data);
            localStorage.setItem('subscribers', JSON.stringify(subscribers));
            resolve();
        }, 1000);
    });
}

// Modal functions
function showModal() {
    document.getElementById('successModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('successModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('successModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Close modal with X button
document.querySelector('.close').addEventListener('click', closeModal);

// Donation card selection
let selectedAmount = null;

document.querySelectorAll('.donation-card').forEach(card => {
    card.addEventListener('click', function() {
        // Remove selected class from all cards
        document.querySelectorAll('.donation-card').forEach(c => {
            c.classList.remove('selected');
        });
        
        // Add selected class to clicked card
        this.classList.add('selected');
        
        // Get the amount
        const amount = this.dataset.amount;
        
        if (amount === 'custom') {
            document.getElementById('customAmountInput').style.display = 'block';
            selectedAmount = null;
        } else {
            document.getElementById('customAmountInput').style.display = 'none';
            selectedAmount = amount;
        }
    });
});

// Donation button handler
document.getElementById('donateBtn').addEventListener('click', function() {
    let amount = selectedAmount;
    
    // Check if custom amount is selected
    if (document.querySelector('.donation-card[data-amount="custom"]').classList.contains('selected')) {
        const customAmount = document.getElementById('customAmount').value;
        if (!customAmount || customAmount < 1) {
            alert('Please enter a valid amount');
            return;
        }
        amount = customAmount;
    }
    
    if (!amount) {
        alert('Please select a donation amount');
        return;
    }
    
    // TODO: Integrate with Stripe or PayPal
    // For now, redirect to a placeholder
    processDonation(amount);
});

function processDonation(amount) {
    // This is where you'd integrate with Stripe or PayPal
    // Example Stripe integration:
    
    console.log(`Processing donation of $${amount}`);
    
    // Placeholder: Show alert
    alert(`Thank you for your $${amount} donation! 🙏\n\nPayment integration coming soon.\n\nFor now, you can donate via:\nVenmo: @badbossguide\nPayPal: support@badbossguide.com`);
    
    /* STRIPE EXAMPLE (uncomment and configure when ready):
    
    // Load Stripe
    const stripe = Stripe('your_stripe_publishable_key');
    
    // Create checkout session
    fetch('/create-checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: amount })
    })
    .then(response => response.json())
    .then(session => {
        return stripe.redirectToCheckout({ sessionId: session.id });
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Payment processing error. Please try again.');
    });
    */
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
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

// Phone number formatting
document.getElementById('phone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0) {
        if (value.length <= 3) {
            value = value;
        } else if (value.length <= 6) {
            value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
        } else {
            value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
        }
    }
    e.target.value = value;
});

// Track page engagement (optional analytics placeholder)
let timeOnPage = 0;
setInterval(() => {
    timeOnPage++;
    // You can send this data to your analytics service
    if (timeOnPage % 30 === 0) {
        console.log(`User has been on page for ${timeOnPage} seconds`);
    }
}, 1000);

// Detect if user came from YouTube
const urlParams = new URLSearchParams(window.location.search);
const source = urlParams.get('source');
if (source === 'youtube') {
    console.log('User came from YouTube');
    // You could highlight something specific or track this
}
