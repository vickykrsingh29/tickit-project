export default interface POC {
    id: number;
    name: string;
    designation: string;
    department: string;
    socialHandles: { platform: string; link: string }[];
    phone: string;
    email: string;
    remarks: string;
}