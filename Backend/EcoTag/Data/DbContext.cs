using EcoTag.Models;
using Microsoft.EntityFrameworkCore;

namespace EcoTag.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(
            DbContextOptions<AppDbContext> options
        ) : base(options)
        {
        }

        public DbSet<UserModel> Users => Set<UserModel>();

        protected override void OnModelCreating(
            ModelBuilder modelBuilder
        )
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UserModel>()
                .HasIndex(x => x.Email)
                .IsUnique();
        }
    }
}