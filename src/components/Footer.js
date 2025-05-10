import Link from "next/link";

export default function Footer() {
  return (
    <footer id="footer" className="bg-gray-100 text-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* About Section */}
          <div>
            <Link href="/" className="text-2xl font-bold text-gray">
              SozoDigiCare
            </Link>
            <div className="mt-4 space-y-1 text-sm">
              <p>A108 Adam Street</p>
              <p>New York, NY 535022</p>
              <p className="mt-3"><strong>Phone:</strong> +1 5589 55488 55</p>
              <p><strong>Email:</strong> info@example.com</p>
            </div>
            <div className="flex space-x-4 mt-4 text-xl text-gray-600">
              <a href="#"><i className="bi bi-twitter-x" /></a>
              <a href="#"><i className="bi bi-facebook" /></a>
              <a href="#"><i className="bi bi-instagram" /></a>
              <a href="#"><i className="bi bi-linkedin" /></a>
            </div>
          </div>

          {/* Useful Links */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Useful Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:underline">Home</Link></li>
              <li><a href="#" className="hover:underline">About us</a></li>
              <li><a href="#" className="hover:underline">Services</a></li>
              <li><Link href="/terms-of-service" className="hover:underline">Terms of service</Link></li>
              <li><Link href="/privacy-policy" className="hover:underline">Privacy policy</Link></li>
            </ul>
          </div>

          {/* Our Services */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Our Services</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:underline">Medical Tourism Packages</a></li>
              <li><a href="#" className="hover:underline">Consultation Appointments</a></li>
              <li><a href="#" className="hover:underline">Health Consultations</a></li>
              <li><a href="#" className="hover:underline">Medical Expertise Access</a></li>
              <li><a href="#" className="hover:underline">Health Equity Solutions</a></li>
            </ul>
          </div>

          {/* Our Vision */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Our Vision</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:underline">Global Health Equity</a></li>
              <li><a href="#" className="hover:underline">Accessible Medical Care</a></li>
              <li><a href="#" className="hover:underline">Empowering Marginalized Communities</a></li>
              <li><a href="#" className="hover:underline">Cross-Border Medical Solutions</a></li>
              <li><a href="#" className="hover:underline">Personalized Healthcare</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="bg-gray-200 text-center py-6 text-sm">
        <p>
          © <span>{new Date().getFullYear()}</span>{" "}
          <strong className="text-gray">SozoDigiCare</strong> – All Rights Reserved
        </p>
        <p className="mt-1">
          Developed by{" "}
          <a
            href="https://digi-realm.com/"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Digi-Realm City Solution
          </a>
        </p>
      </div>
    </footer>
  );
}
