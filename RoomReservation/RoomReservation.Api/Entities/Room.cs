namespace RoomReservation.Api.Entities
{
    public class Room
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public int Floor { get; set; }
        public List<string> Equipment { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
