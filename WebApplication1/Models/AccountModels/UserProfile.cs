using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApplication1.Models.AccountModels
{
    public class UserProfile
    {
        public virtual string Email { get; set; }
        public virtual bool EmailConfirmed { get; set; }
        public virtual int Id { get; set; }
        public string UserName { get; set; }
        public List<string> Roles { get; set; }

        public UserProfile(User user)
        {
            if(user != null)
            {
                Email = user.Email;
                EmailConfirmed = user.EmailConfirmed;
                Id = user.Id;
                UserName = user.UserName;
            }
        }
    }
}