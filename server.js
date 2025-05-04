import 'dotenv/config';          // ← loads process.env.SMS_TO_KEY
import express from 'express';
import fetch   from 'node-fetch';

const app = express();

// built-in body parsing (you don't need body-parser separately in Express 4.16+)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const API_KEY = process.env.SMS_TO_KEY;
if (!API_KEY) {
  console.error('❌ Missing SMS_TO_KEY in .env');
  process.exit(1);
}

// Serve the HTML form
app.get('/', (req, res) => {
  const status = req.query.status;
  const message = req.query.message;
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>John Doe - Portfolio</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        <style>
          :root {
            --primary: #2563eb;
            --secondary: #1e40af;
            --dark: #1f2937;
            --light: #f3f4f6;
            --success: #22c55e;
            --error: #ef4444;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: var(--dark);
            background: linear-gradient(135deg, #f6f6f6 0%, #ffffff 100%);
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
          }
          
          header {
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 1.5rem 0;
            position: sticky;
            top: 0;
            z-index: 100;
          }
          
          nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
          }
          
          .logo {
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--primary);
            text-decoration: none;
          }
          
          .nav-links {
            display: flex;
            gap: 2rem;
          }
          
          .nav-links a {
            color: var(--dark);
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s;
          }
          
          .nav-links a:hover {
            color: var(--primary);
          }
          
          .hero {
            text-align: center;
            padding: 4rem 0;
            background: white;
            margin: 2rem 0;
            border-radius: 1rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          }
          
          .hero h1 {
            font-size: 3rem;
            font-weight: 800;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          
          .hero p {
            font-size: 1.25rem;
            color: #666;
            max-width: 600px;
            margin: 0 auto;
          }

          .section {
            padding: 4rem 0;
          }

          .section-title {
            font-size: 2rem;
            margin-bottom: 2rem;
            text-align: center;
            color: var(--dark);
          }

          .about-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            align-items: center;
            background: white;
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          }

          .about-image {
            width: 100%;
            height: 400px;
            background: #ddd;
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            color: #666;
          }

          .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
          }

          .skill-card {
            background: white;
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            text-align: center;
          }

          .skill-card i {
            font-size: 2.5rem;
            color: var(--primary);
            margin-bottom: 1rem;
          }

          .contact-form {
            background: white;
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            max-width: 600px;
            margin: 0 auto;
          }

          .form-group {
            margin-bottom: 1.5rem;
          }

          .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
          }

          .form-group input,
          .form-group textarea {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 2px solid #e5e7eb;
            border-radius: 0.5rem;
            font-size: 1rem;
            transition: border-color 0.3s;
          }

          .form-group input:focus,
          .form-group textarea:focus {
            outline: none;
            border-color: var(--primary);
          }

          button {
            background: var(--primary);
            color: white;
            padding: 0.75rem 2rem;
            border: none;
            border-radius: 0.5rem;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.3s;
            width: 100%;
          }

          button:hover {
            background: var(--secondary);
          }

          footer {
            text-align: center;
            padding: 2rem;
            margin-top: 4rem;
            color: #666;
          }

          @media (max-width: 768px) {
            .hero h1 {
              font-size: 2rem;
            }
            
            .nav-links {
              display: none;
            }
            
            .container {
              padding: 1rem;
            }

            .about-content {
              grid-template-columns: 1fr;
            }
          }

          /* Notification styles */
          .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            background: white;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            transform: translateX(150%);
            transition: transform 0.3s ease-in-out;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .notification.show {
            transform: translateX(0);
          }
          
          .notification.success {
            border-left: 4px solid var(--success);
          }
          
          .notification.error {
            border-left: 4px solid var(--error);
          }
          
          .notification i {
            font-size: 1.25rem;
          }
          
          .notification.success i {
            color: var(--success);
          }
          
          .notification.error i {
            color: var(--error);
          }

          /* Scroll down button */
          .scroll-down {
            position: fixed;
            bottom: 40px;
            right: 40px;
            background: var(--primary);
            color: white;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            opacity: 0;
            visibility: hidden;
            z-index: 1000;
          }

          .scroll-down.show {
            opacity: 1;
            visibility: visible;
          }

          .scroll-down:hover {
            background: var(--secondary);
            transform: translateY(-3px);
          }
        </style>
      </head>
      <body>
        ${status ? `
          <div class="notification ${status}" id="notification">
            <i class="fas fa-${status === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message || (status === 'success' ? 'Message sent successfully!' : 'Failed to send message')}</span>
          </div>
        ` : ''}
        
        <div class="scroll-down" id="scrollDown">
          <i class="fas fa-arrow-down"></i>
        </div>
        
        <header>
          <nav>
            <a href="/" class="logo">John Doe</a>
            <div class="nav-links">
              <a href="#about">About</a>
              <a href="#skills">Skills</a>
              <a href="#contact">Contact</a>
            </div>
          </nav>
        </header>
        
        <div class="container">
          <section class="hero">
            <h1>Full Stack Developer</h1>
            <p>Building modern web applications with passion and precision</p>
          </section>
          
          <section id="about" class="section">
            <h2 class="section-title">About Me</h2>
            <div class="about-content">
              <div class="about-image">
                <i class="fas fa-user"></i>
              </div>
              <div>
                <h3>Hello! I'm John Doe</h3>
                <p>I'm a passionate full-stack developer with 5 years of experience in building web applications. I specialize in JavaScript/TypeScript, React, Node.js, and modern web technologies.</p>
                <p>I love solving complex problems and creating user-friendly applications that make a difference. When I'm not coding, you can find me contributing to open-source projects or writing technical blog posts.</p>
              </div>
            </div>
          </section>
          
          <section id="skills" class="section">
            <h2 class="section-title">Skills</h2>
            <div class="skills-grid">
              <div class="skill-card">
                <i class="fab fa-js"></i>
                <h3>JavaScript/TypeScript</h3>
                <p>Expert in modern JavaScript and TypeScript development</p>
              </div>
              <div class="skill-card">
                <i class="fab fa-react"></i>
                <h3>React</h3>
                <p>Building responsive and interactive user interfaces</p>
              </div>
              <div class="skill-card">
                <i class="fab fa-node-js"></i>
                <h3>Node.js</h3>
                <p>Server-side development and API integration</p>
              </div>
              <div class="skill-card">
                <i class="fas fa-database"></i>
                <h3>Databases</h3>
                <p>Experience with SQL and NoSQL databases</p>
              </div>
            </div>
          </section>
          
          <section id="contact" class="section">
            <h2 class="section-title">Contact Me</h2>
            <div class="contact-form">
              <form method="POST" action="/send">
                <div class="form-group">
                  <label for="message">Send me a message</label>
                  <textarea 
                    id="message"
                    name="message" 
                    placeholder="Type your message here..." 
                    required 
                    maxlength="160"
                    rows="4"
                  ></textarea>
                </div>
                <button type="submit">Send Message <i class="fas fa-paper-plane"></i></button>
              </form>
            </div>
          </section>
        </div>
        
        <footer>
          <p>&copy; 2025 John Doe. All rights reserved.</p>
        </footer>
        
        <script>
          // Show notification
          const notification = document.getElementById('notification');
          if (notification) {
            setTimeout(() => {
              notification.classList.add('show');
            }, 100);
            
            setTimeout(() => {
              notification.classList.remove('show');
            }, 5000);
          }
          
          // Scroll down button
          const scrollDown = document.getElementById('scrollDown');
          
          window.addEventListener('scroll', () => {
            if (window.scrollY > 200) {
              scrollDown.classList.add('show');
            } else {
              scrollDown.classList.remove('show');
            }
          });
          
          scrollDown.addEventListener('click', () => {
            window.scrollTo({
              top: document.body.scrollHeight,
              behavior: 'smooth'
            });
          });
        </script>
      </body>
    </html>
  `);
});

// Proxy form → SMS.to API
app.post('/send', async (req, res) => {
  const { message } = req.body;
  const payload = {
    to: '639602750550',
    message,
    from: 'WebDemo'
  };

  try {
    const apiRes = await fetch('https://api.sms.to/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });
    const result = await apiRes.json();

    // Redirect back to home with success/error status
    res.redirect(`/?status=${result.success ? 'success' : 'error'}&message=${encodeURIComponent(result.message || '')}`);
  } catch (err) {
    console.error(err);
    res.redirect(`/?status=error&message=${encodeURIComponent(err.message)}`);
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Listening on http://localhost:${PORT}`)
);
