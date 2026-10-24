using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoomReservation.Api.Data;
using RoomReservation.Api.Entities;
using RoomReservation.Api.DTOs;
using System.Threading.Tasks;

namespace RoomReservation.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReservationsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ReservationsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<Reservation>>> GetReservations()
        {
            var reservations = await _context.Reservations
                .Include(r => r.Room)
                .Include(r => r.User)
                .ToListAsync();
            return Ok(reservations);
        }

        [HttpPost]
        public async Task<ActionResult<Reservation>> CreateReservation(CreateReservationDto dto)
        {
            var reservation = new Reservation
            {
                RoomId = dto.RoomId,
                UserId = dto.UserId,
                Title = dto.Title,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                AttendeesCount = dto.AttendeesCount,
                Status = ReservationStatus.Booked
            };

            _context.Reservations.Add(reservation);
            await _context.SaveChangesAsync();

            return Ok(reservation);
        }

    }
}
