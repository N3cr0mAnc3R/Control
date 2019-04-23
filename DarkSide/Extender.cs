using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DarkSide
{
    public static class Extender
    {
        public static void Do<T>(this T source, Action<T> action)
            where T : class
        {
            if (source == null || action == null)
            {
                return;
            }
            action(source);
        }
        public static TOut IfNotNull<TBase, TOut>(this TBase obj, Func<TBase, TOut> func)
            where TBase : class
            where TOut : class
        {
            return (obj != null) ? func(obj) : (TOut)null;
        }
        public static T IfNull<T>(this T source, T value)
            where T : class
        {
            return source ?? value;
        }
    }
}
