export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  fee: number;
  slots: string[];
}

export const doctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Tushar Kalra",
    specialty: "General Physician",
    fee: 300,
    slots: ["10:00 AM", "11:30 AM", "1:00 PM", "3:00 PM"],
  },
  {
    id: "2",
    name: "Dr. Ashootosh Kalra",
    specialty: "Surgeon",
    fee: 500,
    slots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM", "5:30 PM"],
  },
  {
    id: "3",
    name: "Dr. Keerat Kalra",
    specialty: "Gynecologist",
    fee: 400,
    slots: ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"],
  },
  {
    id: "4",
    name: "Dr. Pankaj Bajaj",
    specialty: "Orthopedic",
    fee: 600,
    slots: ["9:30 AM", "11:30 AM", "1:30 PM", "3:30 PM", "5:00 PM"],
  },
];

export const getDoctorById = (id: string): Doctor | undefined => {
  return doctors.find((doctor) => doctor.id === id);
};
