// Example Node.js/Express Backend for Bad Boss Guide
// Install dependencies: npm install express cors dotenv

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with real database in production)
let subscribers = [];
let users = [];

// ============================================
// SIGNUP ENDPOINT
// ============================================
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, phone, smsConsent } = req.body;
        
        // Validate data
        if (!name || !email) {
            return res.status(400).json({ 
                error: 'Name and email are required' 
            });
        }
        
        // Check if email already exists
        const existingUser = subscribers.find(sub => sub.email === email);
        if (existingUser) {
            return res.status(409).json({ 
                error: 'Email already registered' 
            });
        }
        
        // Create subscriber object
        const subscriber = {
            id: Date.now().toString(),
            name,
            email,
            phone: phone || null,
            smsConsent: smsConsent || false,
            signupDate: new Date().toISOString()
        };
        
        subscribers.push(subscriber);
        
        // ============================================
        // EMAIL SERVICE INTEGRATION (Choose one)
        // ============================================
        
        // Option 1: Mailchimp
        /*
        const mailchimp = require('@mailchimp/mailchimp_marketing');
        mailchimp.setConfig({
            apiKey: process.env.MAILCHIMP_API_KEY,
            server: process.env.MAILCHIMP_SERVER_PREFIX
        });
        
        await mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID, {
            email_address: email,
            status: 'subscribed',
            merge_fields: {
                FNAME: name,
                PHONE: phone || ''
            }
        });
        */
        
        // Option 2: SendGrid
        /*
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        await sgMail.send({
            to: email,
            from: 'welcome@badbossguide.com',
            subject: 'Welcome to Bad Boss Guide!',
            html: `
                <h1>Welcome, ${name}!</h1>
                <p>Thank you for joining the Bad Boss Guide community.</p>
                <p>You're now part of a movement to survive and thrive in challenging workplaces.</p>
                <a href="${process.env.SITE_URL}/login">Access Your Member Area</a>
            `
        });
        */
        
        // ============================================
        // SMS INTEGRATION (Twilio)
        // ============================================
        
        if (phone && smsConsent) {
            /*
            const twilio = require('twilio');
            const client = twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );
            
            await client.messages.create({
                body: `Hi ${name}! Welcome to Bad Boss Guide. You're on your way to workplace mastery. Reply STOP to unsubscribe.`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phone
            });
            */
        }
        
        // ============================================
        // DATABASE STORAGE (Choose one)
        // ============================================
        
        // Option 1: Airtable
        /*
        const Airtable = require('airtable');
        const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
            .base(process.env.AIRTABLE_BASE_ID);
        
        await base('Subscribers').create([{
            fields: {
                Name: name,
                Email: email,
                Phone: phone || '',
                SMS_Consent: smsConsent,
                Signup_Date: subscriber.signupDate
            }
        }]);
        */
        
        // Option 2: Firebase Firestore
        /*
        const admin = require('firebase-admin');
        const db = admin.firestore();
        
        await db.collection('subscribers').doc(subscriber.id).set({
            name,
            email,
            phone: phone || null,
            smsConsent,
            signupDate: admin.firestore.FieldValue.serverTimestamp()
        });
        */
        
        // Option 3: MongoDB
        /*
        const mongoose = require('mongoose');
        const Subscriber = require('./models/Subscriber');
        
        const newSubscriber = new Subscriber({
            name,
            email,
            phone,
            smsConsent,
            signupDate: new Date()
        });
        
        await newSubscriber.save();
        */
        
        res.json({ 
            success: true, 
            message: 'Successfully registered!',
            subscriber: {
                id: subscriber.id,
                name: subscriber.name,
                email: subscriber.email
            }
        });
        
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            error: 'Registration failed. Please try again.' 
        });
    }
});

// ============================================
// LOGIN ENDPOINT
// ============================================
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // In production, use proper password hashing (bcrypt)
        const user = subscribers.find(sub => sub.email === email);
        
        if (!user) {
            return res.status(401).json({ 
                error: 'Invalid credentials' 
            });
        }
        
        // Generate JWT token (install: npm install jsonwebtoken)
        /*
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
        */
        
        // Simple response for demo
        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                smsConsent: user.smsConsent,
                signupDate: user.signupDate
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            error: 'Login failed. Please try again.' 
        });
    }
});

// ============================================
// DONATION ENDPOINT (Stripe)
// ============================================
app.post('/api/create-donation', async (req, res) => {
    try {
        const { amount } = req.body;
        
        if (!amount || amount < 1) {
            return res.status(400).json({ 
                error: 'Invalid donation amount' 
            });
        }
        
        // Stripe integration (install: npm install stripe)
        /*
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Bad Boss Guide Support',
                        description: 'Support the creation of free workplace survival content'
                    },
                    unit_amount: Math.round(amount * 100), // Convert to cents
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.SITE_URL}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.SITE_URL}/#support`,
            metadata: {
                purpose: 'donation'
            }
        });
        
        res.json({ 
            sessionId: session.id,
            url: session.url
        });
        */
        
        // Placeholder response
        res.json({ 
            success: true,
            message: 'Donation endpoint ready for Stripe integration',
            amount
        });
        
    } catch (error) {
        console.error('Donation error:', error);
        res.status(500).json({ 
            error: 'Donation processing failed' 
        });
    }
});

// ============================================
// STRIPE WEBHOOK (for successful payments)
// ============================================
app.post('/api/webhook/stripe', express.raw({type: 'application/json'}), async (req, res) => {
    /*
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    
    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
        
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            
            // Send thank you email
            const sgMail = require('@sendgrid/mail');
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            
            await sgMail.send({
                to: session.customer_details.email,
                from: 'support@badbossguide.com',
                subject: 'Thank you for your support!',
                html: `
                    <h1>Thank You! 🙏</h1>
                    <p>Your generous donation of $${session.amount_total/100} helps us create more free content.</p>
                    <p>You're making a real difference for people dealing with workplace challenges.</p>
                `
            });
            
            // Log donation to database
            // ... your database code ...
        }
        
        res.json({ received: true });
    } catch (err) {
        console.error('Webhook error:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
    */
    
    res.json({ message: 'Webhook endpoint ready' });
});

// ============================================
// GET SUBSCRIBER COUNT (for analytics)
// ============================================
app.get('/api/stats', (req, res) => {
    res.json({
        totalSubscribers: subscribers.length,
        smsOptIns: subscribers.filter(s => s.smsConsent).length,
        recentSignups: subscribers.filter(s => {
            const signupDate = new Date(s.signupDate);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return signupDate > weekAgo;
        }).length
    });
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
    console.log(`Bad Boss Guide API running on port ${PORT}`);
    console.log(`\nAvailable endpoints:`);
    console.log(`POST   /api/signup          - Register new user`);
    console.log(`POST   /api/login           - User login`);
    console.log(`POST   /api/create-donation - Process donations`);
    console.log(`POST   /api/webhook/stripe  - Stripe webhooks`);
    console.log(`GET    /api/stats           - Get subscriber stats`);
    console.log(`GET    /api/health          - Health check`);
});

module.exports = app;
