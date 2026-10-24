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
            // 1. Patikriname, ar laikai logiški
            if (dto.EndDate <= dto.StartDate)
            {
                return BadRequest("Rezervacijos pabaigos laikas turi būti vėlesnis už pradžios laiką.");
            }

            // 2. Patikriname, ar kambarys egzistuoja
            var room = await _context.Rooms.FindAsync(dto.RoomId);
            if (room == null)
            {
                return NotFound($"Kambarys su ID {dto.RoomId} neegzistuoja.");
            }

            // 3. Patikriname kambario talpą
            if (dto.AttendeesCount > room.Capacity)
            {
                return BadRequest($"Dalyvių skaičius ({dto.AttendeesCount}) viršija kambario talpą ({room.Capacity}).");
            }

            // 4. Patikriname, ar vartotojas egzistuoja
            var userExists = await _context.Users.AnyAsync(u => u.Id == dto.UserId);
            if (!userExists)
            {
                return NotFound($"Vartotojas su ID {dto.UserId} neegzistuoja.");
            }

            // 5. Patikriname persidengiančias rezervacijas (Overlap check)
            var hasConflict = await _context.Reservations.AnyAsync(r =>
                r.RoomId == dto.RoomId &&
                r.Status != ReservationStatus.Cancelled &&
                dto.StartDate < r.EndDate &&
                dto.EndDate > r.StartDate);

            if (hasConflict)
            {
                return BadRequest("Šiuo laiku kambarys jau yra rezervuotas.");
            }

            // Jei visos patikros praeitos – sukuriame rezervaciją
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

        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelReservation(int id)
        {
            var reservation = await _context.Reservations.FindAsync(id);
            if (reservation == null)
            {
                return NotFound($"Rezervacija su ID {id} nerasta.");
            }

            if (reservation.Status == ReservationStatus.Cancelled)
            {
                return BadRequest("Ši rezervacija jau yra atšaukta.");
            }

            reservation.Status = ReservationStatus.Cancelled;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Rezervacija sėkmingai atšaukta.", reservation });
        }

    }
}
