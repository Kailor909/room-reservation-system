using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoomReservation.Api.DTOs;
using RoomReservation.Api.Data;
using RoomReservation.Api.Entities;

namespace RoomReservation.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    ActiveReservationCount = _context.Reservations
                        .Count(r => r.UserId == u.Id && r.Status == ReservationStatus.Booked)
                }).ToListAsync();

            return Ok(users);
        }
    }
}
