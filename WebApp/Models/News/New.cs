using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApp.Models.News
{
    public class New
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public string Text { get; set; }
    }
}