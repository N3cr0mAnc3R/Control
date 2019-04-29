using Microsoft.AspNet.Identity.Owin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using WebApp.Models;
using WebApp.Models.Managers;

namespace WebApp.Controllers
{
    public class ProfileController : BaseController
    {
        // GET: Profile
        public ActionResult UserProfile()
        {
            return View(SelectApplicationsByUserId());
        }
        public ActionResult Edit(int Id)
        {
            if (CheckAccess(Id))
            {
                return View();
            }
            return Redirect("/");
        }
        public bool CheckAccess(int Id)
        {
                return ProfileManager.CheckAccess(Id, CurrentUser.Id);       
        }
       public List<ApplicationModel> SelectApplicationsByUserId ()
        {
            return ProfileManager.SelectApplicationsByUserId(CurrentUser.Id);
        }
        protected ProfileManager ProfileManager
        {
            get
            {
                return Request.GetOwinContext().Get<ProfileManager>();
            }
        }
    }
}