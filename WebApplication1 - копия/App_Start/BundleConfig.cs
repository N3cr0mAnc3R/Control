using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Optimization;

namespace WebApplication1.App_Start
{
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("External").Include(""));
            bundles.Add(new ScriptBundle("App").Include(""));
            bundles.Add(new StyleBundle("Css").Include(""));
        }
    }
}