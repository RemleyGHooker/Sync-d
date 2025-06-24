import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const { isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleLogin = () => {
    if (!email.endsWith("@microsoft.com")) {
      setLoginError("Please use your Microsoft email address");
      return;
    }
    // In a real app, this would go through proper OAuth
    window.location.href = '/api/login';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen camp-gradient-main camp-texture flex items-center justify-center">
        <div className="text-white text-center">
          <div className="loading-pulse text-4xl font-bold mb-4">Tripp'In</div>
          <p className="text-green-200">Loading your summer adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-slate-50 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-96 h-96 bg-violet-100 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-violet-200 rounded-full blur-3xl"></div>
      </div>
      <div className="absolute bottom-60 right-16 text-3xl opacity-25">🦅</div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <div className="max-w-4xl w-full text-center space-y-12">
          {/* Hero Section */}
          <div className="space-y-8">
            <h1 className="text-6xl md:text-7xl posh-title bg-gradient-to-r from-violet-600 via-violet-500 to-violet-600 bg-clip-text text-transparent">
              Tripp'In
            </h1>
            <p className="text-xl md:text-2xl posh-subtitle max-w-2xl mx-auto leading-relaxed">
              Premium event networking for Microsoft interns
            </p>
            <p className="text-base text-slate-500 max-w-xl mx-auto posh-font">
              Connect with fellow interns, discover exclusive events, and build meaningful relationships in Seattle's tech scene.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              {
                icon: "🎯",
                title: "Curated Events",
                description: "Hand-picked experiences designed for ambitious professionals"
              },
              {
                icon: "🤝",
                title: "Quality Connections",
                description: "Network with verified Microsoft interns and industry leaders"
              },
              {
                icon: "✨",
                title: "Premium Experience",
                description: "Elevated social experiences with attention to every detail"
              }
            ].map((feature, index) => (
              <Card key={index} className="posh-glass posh-border posh-shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mb-6">{feature.icon}</div>
                  <h3 className="text-xl posh-title text-slate-800 mb-4">{feature.title}</h3>
                  <p className="text-slate-600 posh-font leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 space-y-8">
            {!showLogin ? (
              <Button
                onClick={() => setShowLogin(true)}
                className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white px-12 py-4 text-lg posh-font rounded-xl transform hover:scale-105 transition-all posh-shadow-lg"
              >
                Get Started
              </Button>
            ) : (
              <div className="posh-glass posh-border rounded-xl p-8 max-w-md mx-auto posh-shadow-lg">
                <h3 className="text-2xl posh-title text-slate-800 mb-6">Join Tripp'In</h3>
                <div className="space-y-4">
                  <Input
                    type="email"
                    placeholder="your.email@microsoft.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setLoginError("");
                    }}
                    className="bg-white border-slate-200 text-slate-800 placeholder-slate-400 text-base py-3 rounded-lg posh-font"
                  />
                  {loginError && (
                    <p className="text-red-500 text-sm posh-font">{loginError}</p>
                  )}
                  <Button
                    onClick={handleLogin}
                    disabled={!email}
                    className="w-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white py-3 text-base posh-font rounded-lg"
                  >
                    Continue with Microsoft
                  </Button>
                  <p className="text-xs text-slate-500 text-center posh-font">
                    Exclusive access for Microsoft interns
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
