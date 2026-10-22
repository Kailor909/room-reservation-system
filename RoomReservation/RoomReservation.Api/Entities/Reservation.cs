namespace RoomReservation.Api.Entities
{
    public enum ReservationStatus
    {
        Booked,
        Completed,
        Cancelled
    }
    public class Reservation
    {
        public int Id { get; set; }

        public int RoomId { get; set; }
        public Room? Room { get; set; }

        public int OrganiserId { get; set; }
        public User? Organiser { get; set; }

        public string Title { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int AttendeesCount { get; set; }
        public ReservationStatus Status { get; set; } = ReservationStatus.Booked;
    }
}
