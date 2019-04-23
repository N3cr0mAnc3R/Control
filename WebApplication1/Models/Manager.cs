using DarkSide;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public abstract class Manager: IDisposable
    {
        public Concrete Concrete{ get; set; }

        public void Dispose()
        {
            Concrete.Dispose();
        }
    }
}