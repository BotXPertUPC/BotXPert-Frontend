import React, { useState } from 'react';
import { Menu, X, Heart, Share2, Users, Palette, Zap, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function WelcomePage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const features = [
        {
            icon: <Palette className="w-6 h-6" />,
            title: "Eines de disseny intuïtives",
            description: "Crea dissenys fàcils amb la nostra interfície fàcil d'utilitzar",
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: "Col·laboració",
            description: "Treballa en temps real amb el teu equip",
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: "Rendiment ràpid",
            description: "Programari de disseny ultraràpid que mai et frena",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-deepBlue via-softBlue to-softWhite text-white">
            <div className="screen-container">
                {/* Navigation */}
                <nav className="px-4 py-4">
                    <div className="max-container flex justify-between items-center">
                        <div className="flex items-center space-x-8">
                            <div className="flex items-center space-x-2">
                                <img
                                    src="/logo512.png"
                                    alt="BotXpert Logo"
                                    className="h-10"
                                />
                                <img
                                    src="/nom_app_white.png"
                                    alt="BotXpert White Name Logo"
                                    className="h-10"
                                />
                            </div>
                            <div className="hidden md:flex space-x-6">
                                <button className="nav-link">Casos d'ús</button>
                                <button className="nav-link">Plantilles</button>
                                <button className="nav-link">Recursos</button>
                                <button className="nav-link">Preus</button>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center space-x-4">
                            <button className="nav-link">Inicia sessió</button>
                            <button className="btn-secondary">Registra't gratis</button>
                        </div>

                        <button
                            className="md:hidden text-white"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </nav>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-[#001f3f] p-4">
                        <div className="flex flex-col space-y-4">
                            <button className="nav-link text-left">Casos d'ús</button>
                            <button className="nav-link text-left">Disseny IA</button>
                            <button className="nav-link text-left">Plantilles</button>
                            <button className="nav-link text-left">Recursos</button>
                            <button className="nav-link text-left">Preus</button>
                            <button className="nav-link text-left">Inicia sessió</button>
                            <button className="btn-secondary w-full">Registra't gratis</button>
                        </div>
                    </div>
                )}

                {/* Hero Section */}
                <main className="px-4 py-16 md:py-32 text-center">
                    <div className="max-container">
                        <h2 className="text-4xl md:text-6xl font-bold mb-6">
                            Automatitza la creació de xatbots per a tothom
                        </h2>
                        <p className="text-lg md:text-xl text-paragraphLight mb-4">
                            Fluxos senzills no han de requerir programari complex.
                        </p>
                        <button className="btn-primary" onClick={() => navigate('/main')}>
                            Comença
                        </button>
                    </div>
                </main>

                {/* Features Grid */}
                <section className="px-4 py-16 bg-deepBlue/80">
                    <div className="max-container grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-[#002d5b]/50 p-6 rounded-lg backdrop-blur-sm"
                            >
                                <div className="text-lightBlue mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-[#cceeff]">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Demo Section */}
                <section className="px-4 py-16">
                    <div className="max-container">
                        <div className="bg-[#001f3f]/40 rounded-xl p-4 backdrop-blur-sm">
                            <img
                                src="/BotPresentació.jpg"
                                alt="UI Design Interface"
                                className="w-full rounded-lg shadow-2xl"
                            />
                            <div className="flex justify-between items-center mt-4">
                                <div className="flex space-x-4"></div>
                                    <button className="nav-link">
                                        <Heart className="w-5 h-5 fill-current text-red-500" />
                                    </button>
                                    <button className="nav-link">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                                <button className="flex items-center space-x-2 nav-link">
                                    <span>Més detalls</span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default WelcomePage;
