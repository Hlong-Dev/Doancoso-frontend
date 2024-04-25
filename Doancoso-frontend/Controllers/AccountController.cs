using Microsoft.AspNetCore.Mvc;

namespace Doancoso_frontend.Controllers
{
    public class AccountController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
        public IActionResult SignIn()
        {
            return View();
        }
    }
}
