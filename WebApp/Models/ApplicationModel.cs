using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace WebApp.Models
{
    public class ApplicationModel
    {
        [Required]
        public string Text { get; set; }
        public HttpPostedFileBase[] Files { get; set; }
    }
}