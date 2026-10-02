export const patients = [
  {
    id: "PT-0001",
    firstName: "Ali",
    middleName: "Rajab",
    lastName: "Pandu",
    age: 23,
    gender: "Male",
    phone: "0777809000",
    status: "Active",
    registered: "14 Sep 2026",
  },
  {
    id: "PT-0002",
    firstName: "Amina",
    middleName: "Hassan",
    lastName: "Juma",
    age: 31,
    gender: "Female",
    phone: "0712345678",
    status: "Active",
    registered: "14 Sep 2026",
  },
  {
    id: "PT-0003",
    firstName: "John",
    middleName: "Peter",
    lastName: "Musa",
    age: 28,
    gender: "Male",
    phone: "0755123456",
    status: "Active",
    registered: "13 Sep 2026",
  },
  {
    id: "PT-0004",
    firstName: "Neema",
    middleName: "Joseph",
    lastName: "Mwakalinga",
    age: 26,
    gender: "Female",
    phone: "0766987654",
    status: "Active",
    registered: "13 Sep 2026",
  },
  {
    id: "PT-0005",
    firstName: "David",
    middleName: "Samwel",
    lastName: "Kassim",
    age: 35,
    gender: "Male",
    phone: "0788123456",
    status: "Active",
    registered: "12 Sep 2026",
  },
  {
    id: "PT-0006",
    firstName: "Fatma",
    middleName: "Said",
    lastName: "Omar",
    age: 24,
    gender: "Female",
    phone: "0744234567",
    status: "Active",
    registered: "12 Sep 2026",
  },
  {
    id: "PT-0007",
    firstName: "Hassan",
    middleName: "Ali",
    lastName: "Salum",
    age: 40,
    gender: "Male",
    phone: "0777123456",
    status: "Inactive",
    registered: "11 Sep 2026",
  },
  {
    id: "PT-0008",
    firstName: "Rehema",
    middleName: "John",
    lastName: "Mallya",
    age: 29,
    gender: "Female",
    phone: "0719987654",
    status: "Active",
    registered: "11 Sep 2026",
  },
  {
    id: "PT-0009",
    firstName: "Michael",
    middleName: "Joseph",
    lastName: "Mrema",
    age: 33,
    gender: "Male",
    phone: "0756781234",
    status: "Active",
    registered: "10 Sep 2026",
  },
  {
    id: "PT-0010",
    firstName: "Zainab",
    middleName: "Hamad",
    lastName: "Abdallah",
    age: 27,
    gender: "Female",
    phone: "0767123456",
    status: "Active",
    registered: "10 Sep 2026",
  },
  {
    id: "PT-0011",
    firstName: "Salim",
    middleName: "Rashid",
    lastName: "Bakari",
    age: 38,
    gender: "Male",
    phone: "0787345678",
    status: "Active",
    registered: "09 Sep 2026",
  },
  {
    id: "PT-0012",
    firstName: "Mary",
    middleName: "George",
    lastName: "Lucas",
    age: 30,
    gender: "Female",
    phone: "0745123456",
    status: "Active",
    registered: "09 Sep 2026",
  },
];

const STORAGE_KEY = "clinic_patients";

export function getPatients() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    return JSON.parse(saved);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));

  return patients;
}

export function addPatient(patient) {
  const currentPatients = getPatients();

  const now = new Date();

  const registeredTime = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const queueDate =
    `${now.getFullYear()}-` +
    `${String(now.getMonth() + 1).padStart(2, "0")}-` +
    `${String(now.getDate()).padStart(2, "0")}`;

  const newPatient = {
    ...patient,

    id: generatePatientId(currentPatients),

    registeredTime,

    queueDate,

    queueStatus: "Waiting",
  };

  const updatedPatients = [
    newPatient,
    ...currentPatients,
  ];

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedPatients)
  );

  return newPatient;
}
export function updatePatient(id, updatedPatient) {
  const currentPatients = getPatients();

  const updatedPatients = currentPatients.map((patient) =>
    String(patient.id) === String(id)
      ? {
          ...patient,
          ...updatedPatient,
        }
      : patient
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedPatients)
  );

  return updatedPatients;
}
function generatePatientId(currentPatients) {
  const numbers = currentPatients
    .map((patient) => {
      const match = patient.id?.match(/PT-(\d+)/);
      return match ? Number(match[1]) : 0;
    });

  const nextNumber = Math.max(0, ...numbers) + 1;

  return `PT-${String(nextNumber).padStart(4, "0")}`;
}