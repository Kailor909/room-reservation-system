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
                new Room() { Id = 1, Name = "Didelis kambarys", Capacity = 10, Floor = 3, Equipment = new List<string> { "Projektorius", "Lenta rašymui" }, IsActive = true },
                new Room() { Id = 2, Name = "Mažas kambarys", Capacity = 4, Floor = 5, Equipment = new List<string> { "Televizorius" }, IsActive = true },
                new Room() { Id = 3, Name = "Konferencijų salė", Capacity = 50, Floor = 1, Equipment = new List<string> { "Projektorius", "Ilgas stalas", "Vandens fontanas" }, IsActive = false }
                );
        }
        
    }
}
