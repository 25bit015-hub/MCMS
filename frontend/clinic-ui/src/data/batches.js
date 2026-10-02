const batches = [
  {
    id: 1,
    medicine: "Paracetamol 500mg",
    batchNumber: "PCM-2026-001",
    expiryDate: "2026-10-15",
    quantity: 120,
    status: "Expiring Soon",
  },
  {
    id: 2,
    medicine: "Amoxicillin 500mg",
    batchNumber: "AMX-2026-014",
    expiryDate: "2026-09-28",
    quantity: 75,
    status: "Expiring Soon",
  },
  {
    id: 3,
    medicine: "Metformin 500mg",
    batchNumber: "MET-2026-008",
    expiryDate: "2027-02-20",
    quantity: 200,
    status: "Valid",
  },
  {
    id: 4,
    medicine: "Ciprofloxacin 500mg",
    batchNumber: "CIP-2026-005",
    expiryDate: "2026-09-20",
    quantity: 35,
    status: "Critical",
  },
  {
    id: 5,
    medicine: "Ibuprofen 400mg",
    batchNumber: "IBU-2026-011",
    expiryDate: "2027-06-10",
    quantity: 150,
    status: "Valid",
  },
];

export const getBatches = () => {
  return batches;
};

export default batches;