import { createDynamoModel } from '../../database/dynamodb/dynamodbModel.js';

export const DEFAULT_DEPARTMENTS = [
  {
    code: 'HOUSEKEEPING',
    name: 'Housekeeping',
    description: 'Room cleaning, linen, floor supervision, and public area sanitation',
    icon: 'Sparkles',
    isSystem: true,
    subDepartments: [
      'Room Cleaning & Turn Down',
      'Laundry & Linen Management',
      'Floor Supervisor',
      'Public Area Cleaning',
      'Deep Cleaning & Sanitization',
      'Mini Bar & Amenities Runner',
      'Linen Master & Uniforms',
    ],
  },
  {
    code: 'RECEPTION',
    name: 'Front Desk (Reception)',
    description: 'Guest check-in/out, concierge, reservations, night audit, and lobby relations',
    icon: 'ConciergeBell',
    isSystem: true,
    subDepartments: [
      'Front Desk Receptionist',
      'Concierge & Guest Relations',
      'Night Auditor',
      'Bellhop & Valet Services',
      'Reservations & Bookings',
      'VIP Guest Host',
    ],
  },
  {
    code: 'KITCHEN',
    name: 'Kitchen Staff & F&B',
    description: 'Culinary preparation, Kitchen Display System (KDS), line cooking, and stewarding',
    icon: 'ChefHat',
    isSystem: true,
    subDepartments: [
      'Executive / Head Chef',
      'Line Cook & Station Chef',
      'Pastry & Bakery Chef',
      'Kitchen Steward & Dishwashing',
      'In-Room Dining Runner',
      'Barista & Beverage Specialist',
    ],
  },
  {
    code: 'ACCOUNTS',
    name: 'Accounts & Billing',
    description: 'Folio settlement, invoice generation, revenue management, and audit verification',
    icon: 'DollarSign',
    isSystem: true,
    subDepartments: [
      'Front Office Cashier',
      'Night Audit & Revenue Settlement',
      'Accounts Receivable & Ledger',
      'Cost Comptroller & Inventory',
    ],
  },
  {
    code: 'MAINTENANCE',
    name: 'Maintenance & Engineering',
    description: 'HVAC systems, electricals, plumbing, equipment repair, and property upkeep',
    icon: 'Wrench',
    isSystem: false,
    subDepartments: [
      'HVAC & Air Conditioning Specialist',
      'Electrical & Lighting Technician',
      'Plumbing & Water Systems',
      'Carpentry & Painting Specialist',
      'Safety, Fire & Security Engineering',
    ],
  },
  {
    code: 'SECURITY',
    name: 'Security & Safety',
    description: 'Premises surveillance, gate control, keycard access audit, and emergency response',
    icon: 'Shield',
    isSystem: false,
    subDepartments: [
      'CCTV Surveillance Officer',
      'Lobby & Gate Security',
      'Night Patrol & Incident Response',
      'Emergency Response Coordinator',
    ],
  },
  {
    code: 'SPA_WELLNESS',
    name: 'Spa & Wellness',
    description: 'Therapies, wellness treatments, pool deck maintenance, and fitness center management',
    icon: 'HeartHandshake',
    isSystem: false,
    subDepartments: [
      'Senior Massage Therapist',
      'Esthetician & Skin Specialist',
      'Pool Deck Attendant',
      'Fitness & Yoga Instructor',
    ],
  },
];

export const Department = createDynamoModel('Department');

