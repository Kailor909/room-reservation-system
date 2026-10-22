using Microsoft.EntityFrameworkCore;
using RoomReservation.Api.Entities;

namespace RoomReservation.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<Room> Rooms => Set<Room>();
        public DbSet<User> Users => Set<User>();
        public DbSet<Reservation> Reservations => Set<Reservation>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<User>().HasData(
                new User() { Id = 1, FirstName = "Jonas", LastName = "Jonaitis" },
                new User() { Id = 2, FirstName = "Petras", LastName = "Petraitis" }
                );
            modelBuilder.Entity<Room>().HasData(
                new Room() { Id = 1, Name = "Didelis kambarys", Capacity = 10, Floor = 3, Equipment = new List<string> { "Projector", "Whiteboard" }, IsActive = true },
                new Room() { Id = 2, Name = "Mazas kamabarys", Capacity = 4, Floor = 5, Equipment = new List<string> { "TV screen" }, IsActive = true },
                new Room() { Id = 3, Name = "Konferenciju sale", Capacity = 50, Floor = 1, Equipment = new List<string> { "Projector", "Large table", "Water fountain" }, IsActive = false }
                );
        }
        
    }
}
