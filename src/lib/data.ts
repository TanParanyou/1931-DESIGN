export type Language = 'EN' | 'TH';

export const translations = {
    EN: {
        menu: {
            HOME: 'HOME',
            PROJECTS: 'PROJECTS',
            ABOUT: 'ABOUT',
            NEWS: 'NEWS',
            CAREERS: 'CAREERS',
            CONTACT: 'CONTACT',
        },
        home: {
            SELECTED_PROJECTS: 'SELECTED PROJECTS',
            VIEW_ALL: 'VIEW ALL',
        },
        projects: {
            TITLE: 'PROJECTS',
            ALL: 'ALL',
            RELATED: 'RELATED PROJECTS',
        },
        contact: {
            TITLE: 'CONTACT',
            HEADQUARTERS: 'HEADQUARTERS',
            CAREERS: 'CAREERS',
            SEND_MESSAGE: 'SEND US A MESSAGE',
            NAME: 'NAME',
            EMAIL: 'EMAIL',
            SUBJECT: 'SUBJECT',
            MESSAGE: 'MESSAGE',
            SEND: 'SEND MESSAGE',
            SUCCESS: 'Message sent successfully!',
            ERROR: 'Failed to send message. Please try again.',
            SENDING: 'Sending...',
            REQUIRED: 'Required',
        },
        footer: {
            RIGHTS: 'ALL RIGHTS RESERVED.',
        }
    },
    TH: {
        menu: {
            HOME: 'หน้าแรก',
            PROJECTS: 'ผลงาน',
            ABOUT: 'เกี่ยวกับเรา',
            NEWS: 'ข่าวสาร',
            CAREERS: 'ร่วมงานกับเรา',
            CONTACT: 'ติดต่อเรา',
        },
        home: {
            SELECTED_PROJECTS: 'ผลงานที่คัดสรร',
            VIEW_ALL: 'ดูทั้งหมด',
        },
        projects: {
            TITLE: 'ผลงาน',
            ALL: 'ทั้งหมด',
            RELATED: 'ผลงานที่เกี่ยวข้อง',
        },
        contact: {
            TITLE: 'ติดต่อเรา',
            HEADQUARTERS: 'สำนักงานใหญ่',
            CAREERS: 'ร่วมงานกับเรา',
            SEND_MESSAGE: 'ส่งข้อความถึงเรา',
            NAME: 'ชื่อ',
            EMAIL: 'อีเมล',
            SUBJECT: 'หัวข้อ',
            MESSAGE: 'ข้อความ',
            SEND: 'ส่งข้อความ',
            SUCCESS: 'ส่งข้อความเรียบร้อยแล้ว!',
            ERROR: 'ส่งข้อความไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
            SENDING: 'กำลังส่ง...',
            REQUIRED: 'จำเป็น',
        },
        footer: {
            RIGHTS: 'สงวนลิขสิทธิ์',
        }
    }
};

export const projects = [
    {
        id: 1,
        title: "SKYLINE TOWER",
        location: "BANGKOK",
        category: "COMMERCIAL",
        image: "/images/slide1.png",
        description: "A landmark mixed-use development in the heart of Bangkok, featuring sustainable design and cutting-edge technology.",
        year: "2024",
        gallery: [
            "/images/slide1.png",
            "/images/slide2.png",
            "/images/slide3.png",
            "/images/slide1.png"
        ]
    },
    {
        id: 2,
        title: "THE PAVILION",
        location: "PHUKET",
        category: "HOSPITALITY",
        image: "/images/slide2.png",
        description: "Luxury resort pavilion integrating seamless indoor-outdoor living with the natural tropical landscape.",
        year: "2023",
        gallery: [
            "/images/slide2.png",
            "/images/slide3.png",
            "/images/slide1.png"
        ]
    },
    {
        id: 3,
        title: "URBAN OASIS",
        location: "CHIANG MAI",
        category: "RESIDENTIAL",
        image: "/images/slide3.png",
        description: "Modern residential complex focusing on green spaces and community living in the urban context.",
        year: "2024",
        gallery: [
            "/images/slide3.png",
            "/images/slide1.png",
            "/images/slide2.png"
        ]
    },
    {
        id: 4,
        title: "RIVERSIDE RESIDENCE",
        location: "BANGKOK",
        category: "RESIDENTIAL",
        image: "/images/slide2.png",
        description: "Exclusive waterfront residences offering panoramic views of the Chao Phraya River.",
        year: "2022",
        gallery: [
            "/images/slide2.png",
            "/images/slide1.png"
        ]
    },
    {
        id: 5,
        title: "KNOWLEDGE CENTER",
        location: "KHON KAEN",
        category: "EDUCATION",
        image: "/images/slide1.png",
        description: "A modern educational facility designed to foster collaboration and innovation.",
        year: "2023",
        gallery: [
            "/images/slide1.png",
            "/images/slide3.png"
        ]
    },
    {
        id: 6,
        title: "CITY HUB",
        location: "BANGKOK",
        category: "COMMERCIAL",
        image: "/images/slide3.png",
        description: "Mixed-use commercial hub connecting transit, retail, and office spaces.",
        year: "2025",
        gallery: [
            "/images/slide3.png",
            "/images/slide2.png",
            "/images/slide1.png"
        ]
    },
];

export const news = [
    {
        id: 1,
        date: "NOV 20, 2025",
        title: "1931 WINS BEST DESIGN AWARD 2025",
        category: "AWARDS",
        image: "/images/slide1.png",
        content: "We are honored to receive the Best Design Award 2025 for our work on the Skyline Tower project. This recognition reflects our commitment to excellence and innovation in architectural design. The jury praised the project's integration of sustainable technologies and its positive impact on the urban fabric."
    },
    {
        id: 2,
        date: "OCT 15, 2025",
        title: "SKYLINE TOWER GRAND OPENING",
        category: "EVENTS",
        image: "/images/slide2.png",
        content: "The Skyline Tower officially opened its doors today, marking a new chapter in Bangkok's architectural landscape. The ceremony was attended by city officials and industry leaders. The tower stands as a testament to modern engineering and design."
    },
    {
        id: 3,
        date: "SEP 01, 2025",
        title: "NEW SUSTAINABLE DESIGN INITIATIVE",
        category: "NEWS",
        image: "/images/slide3.png",
        content: "1931 Co., Ltd. is proud to announce a new initiative focused on sustainable design practices. We are committing to reducing the carbon footprint of all our future projects by 30% over the next five years through the use of eco-friendly materials and energy-efficient systems."
    },
    {
        id: 4,
        date: "AUG 10, 2025",
        title: "LECTURE AT BANGKOK DESIGN WEEK",
        category: "EVENTS",
        image: "/images/slide1.png",
        content: "Our lead architect gave a keynote lecture at Bangkok Design Week, discussing the future of urban living and the role of architecture in shaping resilient communities. The talk was well-received and sparked interesting discussions among attendees."
    },
];

export const careers = [
    {
        id: 1,
        title: "SENIOR ARCHITECT",
        type: "FULL TIME",
        location: "BANGKOK",
        description: "We are looking for an experienced Senior Architect to lead design projects from concept to completion.",
        responsibilities: [
            "Lead architectural design projects and teams.",
            "Coordinate with clients, consultants, and contractors.",
            "Ensure design quality and compliance with regulations.",
            "Mentor junior staff."
        ],
        requirements: [
            "Bachelor's or Master's degree in Architecture.",
            "Minimum 8 years of experience.",
            "Proficiency in Revit, AutoCAD, and SketchUp.",
            "Strong leadership and communication skills."
        ]
    },
    {
        id: 2,
        title: "INTERIOR DESIGNER",
        type: "FULL TIME",
        location: "BANGKOK",
        description: "Creative Interior Designer needed to craft inspiring interior spaces for high-end residential and commercial projects.",
        responsibilities: [
            "Develop interior design concepts and mood boards.",
            "Select materials, furniture, and lighting.",
            "Produce detailed drawings and specifications.",
            "Collaborate with architects and contractors."
        ],
        requirements: [
            "Degree in Interior Design or related field.",
            "Minimum 3 years of experience.",
            "Strong portfolio demonstrating creative ability.",
            "Knowledge of materials and construction details."
        ]
    },
    {
        id: 3,
        title: "JUNIOR ARCHITECT",
        type: "FULL TIME",
        location: "PHUKET",
        description: "Opportunity for a motivated Junior Architect to join our Phuket office and work on exciting hospitality projects.",
        responsibilities: [
            "Assist in design development and documentation.",
            "Create 3D models and renderings.",
            "Prepare presentation materials.",
            "Support senior architects in project coordination."
        ],
        requirements: [
            "Degree in Architecture.",
            "1-3 years of experience.",
            "Proficiency in 3D modeling software.",
            "Eager to learn and grow."
        ]
    },
    {
        id: 4,
        title: "DRAFTSMAN",
        type: "CONTRACT",
        location: "BANGKOK",
        description: "Skilled Draftsman required to assist in the production of technical drawings and construction documents.",
        responsibilities: [
            "Produce accurate technical drawings.",
            "Update drawings based on feedback.",
            "Ensure adherence to drafting standards.",
            "Assist in site measurements."
        ],
        requirements: [
            "Diploma or Certificate in Drafting or Architecture.",
            "Proficiency in AutoCAD.",
            "Attention to detail and accuracy.",
            "Ability to meet deadlines."
        ]
    },
];

export const careersMock = [
    {
        id: 1,
        title: "SENIOR ARCHITECT",
        type: "FULL TIME",
        location: "BANGKOK",
        description: "We are looking for an experienced Senior Architect to lead design projects from concept to completion.",
        responsibilities: [
            "Lead architectural design projects and teams.",
            "Coordinate with clients, consultants, and contractors.",
            "Ensure design quality and compliance with regulations.",
            "Mentor junior staff."
        ],
        requirements: [
            "Bachelor's or Master's degree in Architecture.",
            "Minimum 8 years of experience.",
            "Proficiency in Revit, AutoCAD, and SketchUp.",
            "Strong leadership and communication skills."
        ]
    },
    {
        id: 2,
        title: "INTERIOR DESIGNER",
        type: "FULL TIME",
        location: "BANGKOK",
        description: "Creative Interior Designer needed to craft inspiring interior spaces for high-end residential and commercial projects.",
        responsibilities: [
            "Develop interior design concepts and mood boards.",
            "Select materials, furniture, and lighting.",
            "Produce detailed drawings and specifications.",
            "Collaborate with architects and contractors."
        ],
        requirements: [
            "Degree in Interior Design or related field.",
            "Minimum 3 years of experience.",
            "Strong portfolio demonstrating creative ability.",
            "Knowledge of materials and construction details."
        ]
    },
    {
        id: 3,
        title: "JUNIOR ARCHITECT",
        type: "FULL TIME",
        location: "PHUKET",
        description: "Opportunity for a motivated Junior Architect to join our Phuket office and work on exciting hospitality projects.",
        responsibilities: [
            "Assist in design development and documentation.",
            "Create 3D models and renderings.",
            "Prepare presentation materials.",
            "Support senior architects in project coordination."
        ],
        requirements: [
            "Degree in Architecture.",
            "1-3 years of experience.",
            "Proficiency in 3D modeling software.",
            "Eager to learn and grow."
        ]
    },
    {
        id: 4,
        title: "DRAFTSMAN",
        type: "CONTRACT",
        location: "BANGKOK",
        description: "Skilled Draftsman required to assist in the production of technical drawings and construction documents.",
        responsibilities: [
            "Produce accurate technical drawings.",
            "Update drawings based on feedback.",
            "Ensure adherence to drafting standards.",
            "Assist in site measurements."
        ],
        requirements: [
            "Diploma or Certificate in Drafting or Architecture.",
            "Proficiency in AutoCAD.",
            "Attention to detail and accuracy.",
            "Ability to meet deadlines."
        ]
    },
];