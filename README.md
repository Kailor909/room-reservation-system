# room-reservation-system
# Meeting Room Booking System

Internship assignment project built with ASP.NET Core Web API and React.

## Features
- **Rooms Management:** List and filter rooms by capacity, floor, and equipment.
- **Reservations:** Create, cancel, and end reservations early with full R1–R7 server-side rule validation.
- **Users:** View users and their current active reservation count.
- **Configuration:** Horizon and duration limits managed in `appsettings.json`.

## How to Run

### Backend (.NET API)
1. Navigate to backend folder:
   `cd RoomReservation/RoomReservation.Api`
2. Run the application:
   `dotnet run`
   *(API will be available at https://localhost:7237)*

### Frontend (React)
1. Navigate to client folder:
   `cd RoomReservation/client`
2. Install dependencies:
   `npm install`
3. Start development server:
   `npm run dev`
   *(Client will run at http://localhost:5173)*