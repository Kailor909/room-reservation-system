namespace RoomReservation.Api.DTOs
{
    public class CreateReservationDto
    {
        public int RoomId { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int AttendeesCount { get; set; }
        
        

    }
}
