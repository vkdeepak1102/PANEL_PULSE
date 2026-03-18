const fs = require('fs');
const path = require('path');

const jdFile = 'JD TEST.csv';
const l1File = 'L1 TEST.csv';
const l2File = 'L2 TEST.csv';

function esc(str) {
    if (!str) return '""';
    let clean = str.replace(/\"/g, '""');
    return `"${clean}"`;
}

// --- TRANSCRIPT COMPONENT: POOR PERFORMANCE GENERATOR ---

const genPoorTranscript = (p, c, role, technicalQuestions) => {
    let t = `${p}: Good morning, ${c}. Welcome to the ${role} interview. How are you today?\n` +
            `${c}: Good morning sir, I am doing well, thank you.\n`;
    
    technicalQuestions.forEach(q => {
        t += `${p}: ${q.q}\n`;
        t += `${c}: ${q.a}\n`;
    });

    t += `${p}: Suppose your system performance decreases drastically. How would you debug?\n` +
         `${c}: I would check logs, maybe restart, but I haven't done it before.\n` +
         `${p}: How do you analyze time complexity?\n` +
         `${c}: I understand it in theory, but I struggle calculating it practically.\n` +
         `${p}: Thank you ${c}. Do you have any questions?\n` +
         `${c}: No sir. Thank you.\n` +
         `${p}: Alright, we'll get back to you.`;
    return t;
};

// --- DATA DEFINITION ---

const cases = [
    { 
        id: 'JD2001', cand: 'Arjun Sharma', role: 'Senior Backend Engineer', pid: 'P201', pan: 'Nidhi Gupta', email: 'nidhi.g@panel.ai', 
        jd: 'Strong experience in Java 11+ and Spring Boot; Microservices architecture and distributed systems; Experience with Relational Databases and query optimization.', 
        reason: 'Poor Java internal knowledge and inability to explain microservices patterns.',
        tech: [
            {q: "How does Java handle memory management?", a: "Hmm... I know it has garbage collection, but I'm not clear on the internals."},
            {q: "Explain Spring Boot filter chain internals.", a: "I have heard about it, but I don't know the exact working."},
            {q: "What is the difference between optimistic and pessimistic locking?", a: "I get confused between those two."}
        ]
    },
    { 
        id: 'JD2002', cand: 'Priya Patel', role: 'Frontend Developer', pid: 'P202', pan: 'Rohan Mehta', email: 'rohan.m@panel.ai', 
        jd: 'Expertise in React.js and State Management (Redux/Context API); Proficiency in Tailwind CSS and responsive design; Experience with performance optimization and Web Vitals.', 
        reason: 'Lack of understanding in React reconciliation and web performance vitals.',
        tech: [
            {q: "How does React Reconciliation work?", a: "It updates the UI when state changes, but I don't know the algorithm name."},
            {q: "Explain Cumulative Layout Shift (CLS).", a: "I have seen it in reports, but I don't know how to fix it."},
            {q: "Difference between Redux Thunk and Saga?", a: "I have only used standard Redux, not middleware."}
        ]
    },
    { 
        id: 'JD2003', cand: 'Ankit Verma', role: 'Data Engineer', pid: 'P203', pan: 'Sneha Reddy', email: 'sneha.r@panel.ai', 
        jd: 'Building scalable data pipelines using Python and Apache Spark; Experience with Airflow for orchestration; Knowledge of Snowflake or similar cloud data warehouses.', 
        reason: 'Poor Spark optimization skills and inability to handle data skew.',
        tech: [
            {q: "What is a Spark broadcast join?", a: "I usually let Spark handle it, I don't know when to use broadcast."},
            {q: "How do you handle data skew in Spark?", a: "I'm not sure what data skew means exactly."},
            {q: "Explain Airflow XComs.", a: "I have seen it in code, but never used it myself."}
        ]
    },
    { 
        id: 'JD2004', cand: 'Ishaan Nair', role: 'Angular Developer', pid: 'P204', pan: 'Kavita Iyer', email: 'kavita.i@panel.ai', 
        jd: 'Advanced Angular (15+) and TypeScript; Deep understanding of RxJS and reactive programming; Experience with modular architecture and Unit Testing.', 
        reason: 'Basic RxJS knowledge; failed to explain Observables vs Promises.',
        tech: [
            {q: "Difference between SwitchMap and MergeMap?", a: "I use SwitchMap mostly but I don't know the internal difference."},
            {q: "Explain Angular Change Detection strategy.", a: "It checks for changes in the components, but I'm not sure about 'OnPush'."},
            {q: "How do you handle memory leaks in Angular?", a: "I just restart the browser usually."}
        ]
    },
    { 
        id: 'JD2005', cand: 'Megha Rao', role: 'Cloud Architect', pid: 'P205', pan: 'Vikram Singh', email: 'vikram.s@panel.ai', 
        jd: 'AWS Solutions Architecture Professional; Advanced Infrastructure as Code using Terraform; Portfolio in high-availability and serverless computing.', 
        reason: 'Unable to design a high-availability architecture; lacks depth in Terraform state management.',
        tech: [
            {q: "How do you handle Terraform state locking?", a: "I think it happens automatically, I don't know about the backend config."},
            {q: "Explain AWS VPC Peering vs Transit Gateway.", a: "I have heard both but haven't implemented them."},
            {q: "Design a system for 5 9s availability.", a: "I haven't designed such high-availability systems before."}
        ]
    },
    { 
        id: 'JD2006', cand: 'Rahul Deshmukh', role: 'Cloud Support Engineer', pid: 'P206', pan: 'Pooja Joshi', email: 'pooja.j@panel.ai', 
        jd: 'Proficient in AWS Console and CLI troubleshooting; Managing IAM roles and policies; Diagnosing EC2 connectivity and performance issues.', 
        reason: 'Poor troubleshooting skills for EC2 networking and IAM policy conflicts.',
        tech: [
            {q: "How do you troubleshoot an 'Instance Reachability Check' failure?", a: "I would check the console, but I don't know the exact steps."},
            {q: "Explain IAM Policy Evaluation logic.", a: "I usually just give Admin access if something doesn't work."},
            {q: "Difference between Security Groups and NACLs?", a: "I always get confused between those two."}
        ]
    },
    { 
        id: 'JD2007', cand: 'Sameer Khan', role: 'SDET', pid: 'P207', pan: 'Aarti Malhotra', email: 'aarti.m@panel.ai', 
        jd: 'Automation testing with Pytest and Selenium/Appium; Integrating tests into CI/CD pipelines; Mobile application and API testing expertise.', 
        reason: 'Lack of proficiency in Pytest fixtures and CI/CD integration.',
        tech: [
            {q: "Explain Pytest fixtures with session scope.", a: "I use fixtures for setup, but I don't know about scopes."},
            {q: "How do you handle flickering tests?", a: "I just rerun the build until it passes."},
            {q: "Explain Page Object Model implementation.", a: "I have heard the term, but haven't implemented it from scratch."}
        ]
    },
    { 
        id: 'JD2008', cand: 'Deepa Kulkarni', role: 'Junior UI Engineer', pid: 'P208', pan: 'Sandeep Das', email: 'sandeep.d@panel.ai', 
        jd: 'Solid foundation in HTML5, semantic CSS3, and JavaScript ES6; Experience with CSS preprocessors like SASS/LESS; Eye for UI/UX detail.', 
        reason: 'Poor CSS specificity knowledge and basic JS mistakes.',
        tech: [
            {q: "Explain CSS Specificity hierarchy.", a: "I use !important for everything that doesn't align correctly."},
            {q: "What is a Closure in JavaScript?", a: "I've read about it, but I can't explain it with an example."},
            {q: "Difference between Flexbox and Grid?", a: "I mostly use Margins for layout."}
        ]
    },
    { 
        id: 'JD2009', cand: 'Amit Trivedi', role: 'Cloud Engineer', pid: 'P209', pan: 'Shweta Saxena', email: 'shweta.s@panel.ai', 
        jd: 'Managing AWS Infrastructure (EC2, S3, RDS, VPC); Scripting with Python/Bash for automation; Implementing backup and disaster recovery plans.', 
        reason: 'Basic AWS connectivity issues; unable to explain VPC subnetting.',
        tech: [
            {q: "Explain the difference between Public and Private subnets.", a: "One is public and one is private, I don't know about the Route Table part."},
            {q: "How do you automate RDS backups?", a: "I think AWS does it, I haven't configured it myself."},
            {q: "What is Boto3?", a: "I don't know, is it an AWS service?"}
        ]
    },
    { 
        id: 'JD2010', cand: 'Neha Bhardwaj', role: 'Data Scientist', pid: 'P210', pan: 'Manish Pandey', email: 'manish.p@panel.ai', 
        jd: 'Strong background in Machine Learning and Statistical Modeling; Proficient in Python (Scikit-Learn, Pandas); Experience in data visualization and reporting insights.', 
        reason: 'Unable to explain Bias-Variance tradeoff or handle missing data.',
        tech: [
            {q: "Explain the Bias-Variance tradeoff.", a: "I have heard of it, but I don't know the mathematical implication."},
            {q: "How do you handle missing data in a dataset?", a: "I just delete the rows usually."},
            {q: "Explain Random Forest algorithm.", a: "It uses many trees, but I don't know how they combine the results."}
        ]
    },
    { 
        id: 'JD2011', cand: 'Varun Chawla', role: 'DevOps Engineer', pid: 'P211', pan: 'Ritu Kapoor', email: 'ritu.k@panel.ai', 
        jd: 'CI/CD pipeline automation with Jenkins and GitLab; Containerization expertise with Docker and Kubernetes; Expertise in Infrastructure Monitoring tools.', 
        reason: 'Very basic Docker knowledge; unable to write a multi-stage Dockerfile.',
        tech: [
            {q: "What is a multi-stage Dockerfile?", a: "I have not used it before."},
            {q: "Explain Kubernetes Pod lifecycle.", a: "I know they start and stop, but I don't know the states."},
            {q: "Difference between Jenkins Freestyle and Pipeline?", a: "I only use the UI to configure Jenkins."}
        ]
    },
    { 
        id: 'JD2012', cand: 'Sanjay G', role: 'Security Engineer', pid: 'P212', pan: 'Madhu S', email: 'madhu.s@panel.ai', 
        jd: 'Specialized in OAuth 2.0 and PKCE protocols; Mobile security auditing; Deep understanding of cryptography and identity management.', 
        reason: 'Poor understanding of OAuth2 grant types and PKCE purpose.',
        tech: [
            {q: "Why do we use PKCE in mobile apps?", a: "I don't know what PKCE stands for."},
            {q: "Explain the difference between ID Token and Access Token.", a: "I get confused between those two."},
            {q: "What is SQL Injection?", a: "I know it's a security threat, but I can't explain how it's executed."}
        ]
    },
    { 
        id: 'JD2013', cand: 'Vivek M', role: 'Project Manager', pid: 'P213', pan: 'Anjali K', email: 'anjali.k@panel.ai', 
        jd: 'Experienced Agile Project Manager / Scrum Master; Managing project financials and stakeholder reporting; Proficient in Jira and Confluence.', 
        reason: 'Inability to explain Agile metrics or manage scope creep.',
        tech: [
            {q: "How do you calculate Velocity in Scrum?", a: "I haven't used that metric before."},
            {q: "Explain the purpose of a Sprint Retrospective.", a: "It's just a meeting at the end of the sprint."},
            {q: "How do you handle scope creep?", a: "I just tell the team to work harder."}
        ]
    },
    { 
        id: 'JD2014', cand: 'Swati B', role: 'Database Administrator', pid: 'P214', pan: 'Kiran P', email: 'kiran.p@panel.ai', 
        jd: 'Database Administration (PostgreSQL/MySQL); Expertise in Sharding and high-availability setups; Experience in performance tuning and query indexing.', 
        reason: 'Blank on database sharding and performance tuning concepts.',
        tech: [
            {q: "What is Database Sharding?", a: "I have not designed sharded systems before."},
            {q: "Explain the difference between B-Tree and Hash index.", a: "I always use the default index."},
            {q: "How do you optimize a slow SQL query?", a: "I just add more RAM to the server."}
        ]
    },
    { 
        id: 'JD2015', cand: 'Manoj R', role: 'iOS Developer', pid: 'P215', pan: 'Geeta V', email: 'geeta.v@panel.ai', 
        jd: 'iOS Developer (Swift, SwiftUI, Combine); Experience with CoreData and local storage persistence; Focus on performance and memory management.', 
        reason: 'Poor Swift knowledge; unable to explain ARC or Optionals.',
        tech: [
            {q: "Explain Optional Unwrapping in Swift.", a: "I use ! for everything to make it work."},
            {q: "What is the result of a retain cycle in Swift?", a: "I don't know the impact of that."},
            {q: "Difference between struct and class in Swift?", a: "I use them interchangeably."}
        ]
    },
    { 
        id: 'JD2016', cand: 'Suresh L', role: 'C++ Developer', pid: 'P216', pan: 'Preeti J', email: 'preeti.j@panel.ai', 
        jd: 'Low-latency C++ developer; Advanced Concurrency and Lock-free programming; Expertise in Financial systems and High-Frequency Trading architectures.', 
        reason: 'Failed to explain C++ memory model or lock-free concepts.',
        tech: [
            {q: "Explain the C++ Memory Model.", a: "I have not studied it in detail."},
            {q: "What is a lock-free queue?", a: "I have not implemented such data structures."},
            {q: "Difference between std::move and std::forward?", a: "I get confused between those two."}
        ]
    }
];

// --- GENERATION ---

// JD TEST
const jdLines = ['Job Interview ID,JD'];
cases.forEach(c => jdLines.push(`${c.id},${esc(c.jd)}`));
fs.writeFileSync(jdFile, jdLines.join('\n'));

// L1 TEST
const l1Lines = ['Job Interview ID,Candidate Name,role,panel_member_id,Panel Name,panel_member_email,JD,L1_decision,L1 Transcript'];
cases.forEach(c => {
    const transcript = genPoorTranscript(c.pan, c.cand, c.role, c.tech);
    l1Lines.push(`${c.id},${c.cand},${c.role},${c.pid},${c.pan},${c.email},${esc(c.jd)},Select,${esc(transcript)}`);
});
fs.writeFileSync(l1File, l1Lines.join('\n'));

// L2 TEST
const l2Lines = ['Job Interview ID,candidate_name,role,panel_member_id,panel_member_name,panel_member_email,JD,l2_decision,L2 Rejected Reason'];
cases.forEach(c => {
    l2Lines.push(`${c.id},${c.cand},${c.role},${c.pid},${c.pan},${c.email},${esc(c.jd)},Reject,${esc(c.reason)}`);
});
fs.writeFileSync(l2File, l2Lines.join('\n'));

console.log(`✓ Generated: ${jdFile}`);
console.log(`✓ Generated: ${l1File}`);
console.log(`✓ Generated: ${l2File}`);
console.log(`SUCCESS: All 16 'Perfect' test cases updated with Indian names and unique cache-busting IDs.`);
