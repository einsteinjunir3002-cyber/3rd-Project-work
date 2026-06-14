# SmartLearn AI – Intelligent Learning Management System

SmartLearn AI is a next-generation, AI-integrated Learning Management System (LMS) prototype built as a final year college project architecture plan. It features highly responsive student and lecturer dashboards, simulated AI academic advisors, career guidance testers, GPA calculators, past question explainers, and interactive forum discussion boards.

---

## 📂 Project Structure

The project has been established under a robust **Three-Tier Architecture** format (Presentation Layer, Application state, and Simulated DB) using modern HTML5, CSS3, and JavaScript, meaning **it requires zero server setup** and can be run instantly in any standard browser.

```text
project work trial/
├── index.html                   # Master Landing page & interactive SPA shell
├── picture/                     # Dedicated picture folder containing high-fidelity vector mockups
│   ├── hero_illustration.svg    # Main landing page graphic
│   ├── ug_campus.svg            # University of Ghana architectural tower vector
│   ├── knust_campus.svg         # KNUST science and engineering vector
│   ├── ashesi_campus.svg        # Ashesi hilltop solar-paneled campus vector
│   ├── upsa_campus.svg          # UPSA modern high-rise office block vector
│   ├── central_campus.svg       # Central University suburban arches vector
│   ├── avatar_student.svg       # Friendly student avatar with graduation cap
│   └── avatar_lecturer.svg      # Professional lecturer avatar wearing glasses
├── assets/
│   ├── css/
│   │   └── style.css            # Modern glassmorphism system & dual light/dark styles
│   └── js/
│       └── app.js               # Dynamic routing engine, State sharing DB & AI logic
└── README.md                    # This developer guide
```

---

## 🖼️ Picture Folder Checklist

To prevent broken link icons and give your project an **ultra-premium, award-winning appearance right out of the box**, we have pre-coded sharp, responsive, and light vector illustrations (SVGs) for every single picture asset. 

If you want to replace these default vector drawings with **real photographs (JPEGs/PNGs)**, here is the exact checklist of what pictures to place in the `picture/` folder and what names/updates to apply:

| Current File Name | Recommended Replacement Image | Dimension | Where It is Linked in the Code |
| :--- | :--- | :--- | :--- |
| **`hero_illustration.svg`** | A high-quality digital learning graphic or stock photo of students with laptops. | `800 x 600px` | [index.html:L42](file:///c:/Users/einst/Desktop/project%20work%20trial/index.html#L42) |
| **`ug_campus.svg`** | A real photo of the iconic white tower or main gate of the **University of Ghana, Legon**. | `400 x 250px` | [index.html:L124](file:///c:/Users/einst/Desktop/project%20work%20trial/index.html#L124) |
| **`knust_campus.svg`** | A real photo of the **KNUST** main campus entrance, administrative block, or library. | `400 x 250px` | [index.html:L134](file:///c:/Users/einst/Desktop/project%20work%20trial/index.html#L134) |
| **`ashesi_campus.svg`** | A photo showcasing the beautiful, eco-friendly hilltop architecture of **Ashesi University**. | `400 x 250px` | [index.html:L144](file:///c:/Users/einst/Desktop/project%20work%20trial/index.html#L144) |
| **`upsa_campus.svg`** | A real corporate photo of the modern high-rise block of **UPSA, Accra**. | `400 x 250px` | [index.html:L154](file:///c:/Users/einst/Desktop/project%20work%20trial/index.html#L154) |
| **`central_campus.svg`** | A real landscape photo of the **Central University, Miotso** campus entrance halls. | `400 x 250px` | Linked dynamically via Career Matcher |
| **`avatar_student.svg`** | A real photo or professional cartoon avatar of a student. | `200 x 200px` | [app.js:L53](file:///c:/Users/einst/Desktop/project%20work%20trial/assets/js/app.js#L53) & Sidebar profile |
| **`avatar_lecturer.svg`** | A real photo or professional avatar of a lecturer/teacher. | `200 x 200px` | [app.js:L54](file:///c:/Users/einst/Desktop/project%20work%20trial/assets/js/app.js#L54) & Grading list |

### How to update file extensions in code:
If you save your new university image as a JPEG (e.g., `ug_campus.jpg`), open [index.html](file:///c:/Users/einst/Desktop/project%20work%20trial/index.html) and simply update the matching line:
* **Before**: `<img src="picture/ug_campus.svg" alt="UG Legon">`
* **After**: `<img src="picture/ug_campus.jpg" alt="UG Legon">`

---

## ⚡ Key Dynamic Features Included

### 1. Dual Portal View & Role Switcher
Transition between **Student** and **Lecturer** portals in one click. Action state sharing is fully simulated:
* **Upload Notes**: Publish a lecture PDF note as a Lecturer, and it is instantly pushed into the Student's "Download Notes" list.
* **Create Assignments**: Publish a task outline as a Lecturer, and it immediately appears on the Student's deadline schedule.
* **Grade Center**: Grade a student's file and write a feedback description as a Lecturer; the student receives a live notification alert, and their assignments dashboard gets updated in real-time.

### 2. Multi-Mode AI Academic Assistant
Navigate between four distinct AI personalities: **Study Assistant**, **Career Advisor**, **Assignment Helper**, and **Programming Tutor**. Experience dynamic chat simulations, code highlighting blocks, and duplication screening.

### 3. Interactive Career Interest Quiz
Answer a 5-question personality interest survey, complete with animated progress meters. SmartLearn AI computes your answers, suggests fitting careers and Ghanaian universities, and graphs a visual flow diagram of your academic track!

### 4. Interactive Term GPA Predictor
Slide estimated grades for your courses, and watch your cumulative projected GPA dynamically recalculate on a glowing dashboard widget in real-time.

### 5. Timetable Board & Stress Meter Check
Log daily stress levels via emojis to generate motivational advice, use the hourly study duration calculator, and review class, homework, and exam listings on a full-size calendar.

---

## 🚀 How to Run the Application
1. Double-click the [index.html](file:///c:/Users/einst/Desktop/project%20work%20trial/index.html) file to open it in Google Chrome, Microsoft Edge, or Safari.
2. Select **Enter Student Hub** or **Lecturer Workspace** to start exploring the system!
3. Toggle the ☀️/🌙 icon in the header bar to experience the dark-mode layout.
