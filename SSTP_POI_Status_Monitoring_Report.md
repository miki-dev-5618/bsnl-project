# INDUSTRIAL TRAINING PROJECT REPORT: SSTP POI STATUS MONITORING SYSTEM

**An Academic Report on Industrial Training**

*Submitted in partial fulfillment of the requirements for the award of the degree of Bachelor of Technology (B.Tech) / Diploma in Engineering*

* **Host Organization:** `[Organization Name, e.g., Bharat Sanchar Nigam Limited (BSNL)]`
* **Project Title:** `[Project Name, e.g., Centralized SSTP POI Status Monitoring System]`
* **Trainee Name:** `[Trainee Name]`
* **Roll Number / Enrollment ID:** `[Trainee Roll Number]`
* **Academic Institution:** `[Academic Institution / University Name]`
* **Department:** `[Department Name, e.g., Electronics and Communication Engineering / Computer Science]`
* **Training Period:** `[Start Date] to [End Date]`
* **Project Mentor / Supervisor:** `[Mentor Name & Designation]`

---

## 1. Introduction

### 1.1 Telecommunications Domain Background
Modern telecommunication networks are highly complex, multi-tiered systems that rely on a web of interconnected signalling nodes to route call control messages, verify subscriber profiles, and manage roaming requests. At the core of this signalling infrastructure is the Signalling System No. 7 (SS7) protocol suite, and its IP-based evolution, SIGTRAN. These protocols govern how switches and network components exchange routing information. 

A critical node within this architecture is the **Service Switching Transfer Point (SSTP)**. The SSTP acts as a signalling router, directing signalling traffic between various network entities such as regional mobile switching centres, home location registers, and transit switches. Without a functional SSTP network, telecommunications service providers cannot establish voice channels, execute mobile registrations, or transmit control signals across circles.

### 1.2 The Concept of Points of Interconnection (POIs)
To facilitate communication between different regional hubs (circles) and competing telecommunications service providers (TSPs), networks must interconnect. The physical and logical interfaces through which BSNL exchanges signalling traffic with other operators or internal administrative boundaries are designated as **Points of Interconnection (POIs)**. 

Each SSTP maintains several POI links. These links can be categorised based on their destination:
* **Inter-Operator POIs**: Connecting the host network's SSTP to the signalling hubs of other domestic telecommunications operators.
* **Intra-Network (Circle) POIs**: Connecting different geographical operating circles within BSNL's national footprint.
* **Transit POIs**: Facilitating traffic routing through national long-distance or international gateway carriers.

### 1.3 Importance of Monitoring SSTP POI Status
Because SSTPs handle all signalling routing, any failure at a Point of Interconnection directly disrupts services. If a POI link degrades or breaks:
1. Signalling messages are delayed, causing packet drops and signalling network congestion.
2. Call setup procedures fail, resulting in call drops and network-busy tones for the subscriber.
3. SLAs (Service Level Agreements) signed between interconnected carriers are breached, attracting significant financial penalties.
4. Maintenance teams suffer from a lack of visibility, making it difficult to isolate whether a failure lies in the local SSTP switch or the interconnected partner's network.

Maintaining constant, real-time visibility into the operational status and connectivity metrics of SSTP POIs is vital. Early identification of broken or degraded interconnect links allows engineers to reroute signalling traffic, notify peer networks, and initiate immediate remediation, thereby upholding network availability and operational integrity.

---

## 2. Project Overview

### 2.1 Purpose and Objectives
The main goal of `BSNL Status Hub` is to build a centralized, web-based monitoring system to track the real-time operational status of BSNL’s **SSTP Points of Interconnection (POIs)**. This system consolidates regional signalling status data into a single-pane dashboard, eliminating manual status checks and distributed command-line monitoring of switches.

The specific objectives of the project are:
* **Centralization**: To aggregate the link status of regional SSTP nodes situated across major metropolitan and regional telecom hubs into a single repository.
* **Real-time Status Visualization**: To offer operations teams a dynamic web dashboard featuring color-coded visual cues (e.g., Green for Healthy, Orange for Degraded, Red for Down) for immediate network status assessment.
* **Automated Alerting**: To develop an email dispatch sub-system that immediately alerts subscribed stakeholders when an SSTP POI fails.
* **Auditability**: To establish an immutable audit trail logging every administrative configuration, state override, and status change for security and troubleshooting.
* **Geographical Mapping**: To integrate a Geographical Information System (GIS) map that overlays node status onto a regional map of India, assisting supervisors in identifying geographic patterns of link failure.

### 2.2 Problems Addressed by the System
Historically, monitoring interconnect links was a highly manual, reactive process. Operations personnel relied on periodic command-line diagnostic tools (like terminal pings and SS7 link alignment checks) run directly on individual SSTP switches. This manual workflow suffered from several major issues:
* **High Mean Time to Detection (MTTD)**: A broken POI link could remain undetected for hours until customer complaints escalated or routing metrics dropped significantly.
* **Communication Gaps**: Alerting regional network engineers during link drops depended on manual calls and emails, causing delays.
* **Lack of Historical Records**: Temporary link drops and status overrides were rarely documented systematically, making root-cause analysis difficult.
* **No Unified Visual Representation**: Senior management and supervisors lacked a unified view to assess circle-level or national-level signalling interconnect health.

### 2.3 Scope of the Application
The scope of `BSNL Status Hub` spans the design, implementation, and deployment of a lightweight, secure web application comprising:
1. **Interactive Dashboard Grid**: A responsive grid containing cards for all monitored regional SSTP gateways. Each card summarizes the number of active POIs and shows the aggregate node status.
2. **POI Management Panel**: An interactive interface (slide-over sheet) that allows engineers with appropriate privileges to mark a POI as Active, Broken, or Resolved and append incident logs.
3. **Audit Ledger System**: A secure table displaying a chronological sequence of status modifications, including timestamps, operators' IDs, and old vs. new values.
4. **Subscriber Management Console**: An administration portal to register, modify, or remove emails from the automated notification distribution list.
5. **Background Status Engine**: A backend cron schedule that simulates network health checks and updates POI records automatically if a link becomes unresponsive.

---

## 3. System Description

### 3.1 High-Level Architecture
The system is built as a multi-tier web application, optimized for high performance, ease of deployment, and minimal resource usage:

```
+-------------------------------------------------------+
|                    PRESENTATION LAYER                 |
|             (React 19, TypeScript, Tailwind)          |
+---------------------------+---------------------------+
                            | (HTTPS / REST API)
                            v
+-------------------------------------------------------+
|                    APPLICATION LAYER                  |
|                 (Express & Node.js 22)                |
+---------------------------+---------------------------+
                            | (Prisma ORM Queries)
                            v
+-------------------------------------------------------+
|                      DATABASE LAYER                   |
|                   (PostgreSQL Instance)               |
+-------------------------------------------------------+
```

1. **Presentation Layer (Frontend)**: A Single Page Application (SPA) built using React. It renders the user interface, manages client-side routing, and interacts with the application layer via JSON-based REST APIs.
2. **Application Layer (Backend)**: An Express-based server running on Node.js. It handles request validation, authentication, business logic for aggregating node states, database query execution, scheduling, and notifications.
3. **Database Layer (Data Store)**: A relational PostgreSQL database that stores user accounts, SSTP nodes, POI status histories, audit logs, and subscriber profiles.

### 3.2 Key Functionalities and Features

#### 3.2.1 Real-Time Dashboard and SSTP Node Cards
The homepage serves as the primary operational dashboard. It displays aggregate metrics (e.g., active POIs, down nodes) followed by a grid of individual SSTP Node cards. Each node corresponds to a major circle gateway (e.g., Delhi SSTP, Chennai SSTP). The background and border styling of the cards dynamically shifts based on the status:
* **UP** (All associated POIs are ACTIVE).
* **DEGRADED** (At least one POI is BROKEN, but some remain ACTIVE).
* **DOWN** (All POIs associated with that specific SSTP node are BROKEN).

#### 3.2.2 Interactive Detail Panel and Status Control
Clicking on an SSTP card slides open a detail panel. This panel lists all POI links terminated on that switch (e.g., "Airtel Interconnect L1", "Jio Interconnect L2"). Authorized operators can toggle the status of individual POIs. Changing a POI's status from `ACTIVE` to `BROKEN` automatically recalculates the parent SSTP's status and updates the UI instantly, without requiring a manual page refresh.

#### 3.2.3 GIS Mapping and Visual Overlays
The application integrates an interactive map interface using Leaflet. The map plots the coordinates of each SSTP location across India. The markers are color-coded in real-time, matching the node status. Operators can hover over or click a marker to view a popup tooltip detailing the node's health and its broken POIs.

#### 3.2.4 Immutable Audit Logging
To meet industrial compliance guidelines, the application features an audit logging subsystem. Every status change, POI toggle, subscriber modification, or admin configuration registers a record in the database. These records contain the user's ID, the affected SSTP and POI, the action taken (e.g., `POI_UPDATED`), the old state, the new state, and a precise timestamp. The audit log UI displays this data in a filterable, paginated table, which cannot be edited or deleted.

#### 3.2.5 Automated Notifications and Scheduler
The backend runs a scheduling service that triggers periodic network polls or health simulations every five minutes. If the health check detects an issue, it updates the database. The alert service then checks the status change: if an SSTP status degrades to `DOWN` or `DEGRADED`, it fetches the mailing list from the subscriber table and uses an email API to dispatch alerts to system engineers, including details about the broken links.

---

## 4. Technologies Used

The technology stack selected for `BSNL Status Hub` emphasizes responsiveness, type safety, modular architecture, and rapid deployment.

### 4.1 Frontend Tech Stack
* **React 19**: Serves as the core library for declarative, component-based user interface development.
* **TypeScript 5**: Provides static typing and early error detection during development.
* **Vite 8**: Serves as the modern, fast frontend build tool and hot-reload dev server.
* **Tailwind CSS 4**: Used for styling the application, facilitating a responsive, clean, and modern layout.
* **React Router 7**: Manages SPA route configurations (Dashboard, Map, Audit Log, Subscribers).
* **Leaflet & React-Leaflet**: Used to construct the interactive GIS map of India with custom icon overlays.
* **Sonner**: Implements unobtrusive, toast-style notifications for instant client-side updates.

### 4.2 Backend Tech Stack
* **Node.js 22**: Provides a fast, asynchronous JavaScript runtime environment for server-side code execution.
* **Express 4**: Web framework used to structure REST API endpoints, middleware routing, and request handlers.
* **Prisma ORM 6.10**: A modern Database Toolkit used to define schemas, execute migrations, and write clean database queries in TypeScript.
* **PostgreSQL**: Relational database storing persistent tables for users, nodes, POIs, subscribers, and logs.
* **JSON Web Token (JWT)**: Used for state-free user authentication and role validation.
* **Bcrypt**: Used for hashing password variables securely before database storage.
* **Zod**: Utilized for request body parsing and validation, ensuring only well-formed JSON is processed by the server.

### 4.3 Third-Party Services and Schedulers
* **Resend SDK**: Integrates the system with cloud email services to handle SMTP transactions and deliver alerts.
* **Node-cron**: A pure JavaScript scheduler running in the Node.js process to invoke regular status monitoring routines.

---

## 5. System Workflow

The architecture operates on a predictable cycle of data ingestion, processing, state transitions, and presentation.

```
                  +--------------------------------+
                  |  POI Status Ingestion          |
                  |  (Operator Toggle / Cron Loop) |
                  +---------------+----------------+
                                  |
                                  v
                  +--------------------------------+
                  |  Database Update (Prisma)      |
                  |  - Set POI Status              |
                  |  - Record Audit Log Entry      |
                  +---------------+----------------+
                                  |
                                  v
                  +--------------------------------+
                  |  Parent SSTP State Calculation |
                  |  (UP, DEGRADED, or DOWN)       |
                  +---------------+----------------+
                                  |
                                  v
                  +---------------+----------------+
                  |  Status Change Assessment      |
                  |  - Did SSTP State Change?      |
                  +-------+---------------+--------+
                          |               |
               (Yes)      |               | (No)
                          v               v
+------------------------------------+  +----------------------+
|  Email Alert Service Dispatch      |  |  Update UI State     |
|  - Fetch Subscriber List           |  |  (React/Tailwind)    |
|  - Send Email via Resend           |  +----------------------+
+------------------------------------+
```

### 5.1 Step-by-Step Status Update Workflow
1. **Trigger Phase**:
   * An operator logs in, accesses the dashboard, opens the Chennai SSTP node panel, and toggles a broken POI link status (e.g., change `ACTIVE` to `BROKEN` because of line alignment failure).
   * Alternatively, the background `node-cron` service triggers its 5-minute health check, queries physical links, and detects that a peer connection is unresponsive.
2. **Ingestion & Validation Phase**:
   * The client or scheduling worker submits an HTTP `PATCH` request to the backend endpoint: `/api/pois/:id`.
   * The backend routing middleware intercepts the request, decodes the JWT to verify user permissions, and passes the payload through a Zod schema to validate parameters (e.g., status must be `ACTIVE`, `BROKEN`, or `RESOLVED`).
3. **Database Write and Aggregation Phase**:
   * The Express controller calls Prisma to update the target POI status in the database.
   * Inside the same route controller, the server recalculates the health of the associated parent SSTP. It queries all POIs belonging to that SSTP:
     * If all POIs are `ACTIVE`, the SSTP is marked `UP`.
     * If some are `ACTIVE` and others are `BROKEN`, the SSTP is marked `DEGRADED`.
     * If all POIs are `BROKEN`, the SSTP is marked `DOWN`.
   * If the aggregate status changes, the database updates the SSTP status.
4. **Audit and Alert Service Phase**:
   * The controller calls the `createAuditLog` utility, which writes the user ID, timestamp, target ID, and the stringified old and new status values into the `audit_logs` database table.
   * If the SSTP's status transitioned to a lower level (e.g., from `UP` to `DEGRADED`), the system initiates the alert sequence. It pulls the list of active subscribers from the `alert_subscribers` table and triggers the `notifyPoiStatus` helper, which uses the Resend SDK to email alerts to operators.
5. **Presentation Update Phase**:
   * The REST API sends a success JSON response back to the client.
   * The React dashboard receives the response, updates local state variables, and displays a toast message using Sonner.
   * The Leaflet map component updates the color of the target circle marker, and the grid card updates its text and border.

---

## 6. Role and Learning as a Trainee

During the industrial training period at `BSNL`, I was actively involved in designing, developing, and deploying modules for `BSNL Status Hub`. This experience bridged the gap between academic theory and software engineering practices.

### 6.1 Trainee Responsibilities
My technical responsibilities during the project included:
* **Frontend Component Design**: Creating modular React components (such as node status cards and sidebar menus) using Tailwind CSS.
* **Routing and Navigation**: Implementing application layouts and route structures using React Router.
* **GIS Map Integration**: Implementing the GIS dashboard using React-Leaflet, placing coordinate markers, and setting color thresholds based on status variables.
* **REST API Endpoint Construction**: Building CRUD endpoints for POI status management, subscriber operations, and audit log histories in Express.
* **Validation & Schema Management**: Defining Zod schemas to validate incoming payloads on the server to prevent SQL injection or database query crashes.
* **Email System Integration**: Setting up the mailing controller using the Resend SDK, handling asynchronous email queueing, and formatting notification templates.

### 6.2 Technical Learning and Exposure
The technical training provided valuable experience in:
* **Full-stack TypeScript Ecosystem**: Developing skills in type-safe development using React, Express, and Prisma, which simplifies data flow tracking.
* **Relational Database Management**: Understanding how databases map objects to relationships, managing foreign keys, writing queries, and handling migrations using Prisma CLI.
* **Asynchronous Programming**: Developing robust asynchronous middleware in Node.js to handle external REST requests, cron schedulers, and SMTP deliveries without blocking execution.
* **UI/UX Design Principles**: Learning to design clean dashboards, slide-overs, and notifications that emphasize essential network metrics.

### 6.3 Understanding Telecommunication Systems
The project provided practical insight into:
* **Signalling Network Infrastructure**: Learning how telecom switches communicate, the role of SSTPs, and the significance of SS7 and SIGTRAN protocols in telecommunications switching.
* **POI Management and Interoperability**: Gaining an understanding of the business and technical arrangements that allow different networks to connect, route traffic, and enforce SLAs.
* **Fault Management Workflows**: Understanding how network operation centres (NOCs) monitor faults, isolate problems, and handle incident escalations.

---

## 7. Conclusion

### 7.1 Project Significance and Practical Benefits
The development and implementation of the **SSTP POI Status Monitoring System** (`BSNL Status Hub`) at `BSNL` represents a major transition from manual, reactive network monitoring to a centralized, automated workflow. By integrating real-time visualization, geographical maps, automated alerting, and audit logging into a single web application, the project delivers several practical benefits:
1. **Reduced Downtime**: Automatic monitoring and instant email notifications significantly shorten the time to detect POI failures, allowing engineers to quickly restore signalling routes.
2. **Improved Accountability**: The write-once, read-only audit logging system ensures that all manual overrides are logged, supporting security audits and training reviews.
3. **Enhanced Operational Visibility**: The interactive GIS map and dashboard provide operations teams and supervisors with clear visibility into the national and regional signalling link footprint.
4. **Optimized Resource Allocation**: Automating status collection frees up engineering hours, allowing personnel to focus on preventative maintenance rather than manual diagnostic checks.

In summary, this industrial training project demonstrates how modern web development frameworks and database ORMs can be applied to legacy telecommunications systems, creating software that improves operational efficiency, network reliability, and service availability.

---

*Verified by:*

__________________________
**`[Mentor Name & Designation]`**
`BSNL`

*Date: June 28, 2026*
