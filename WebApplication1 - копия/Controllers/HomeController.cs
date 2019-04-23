using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WebApplication1.Controllers
{
    public class HomeController : Controller
    {
        // GET: Home
        public ActionResult Template(string path)
        {
            return View("spa" + path);
        }

        public ActionResult Index(string query)
        {
            return View();
        }
    }
}