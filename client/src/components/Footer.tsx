import { Link } from "wouter";
import { Facebook, Linkedin, Twitter, Send, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-blue-500 to-blue-600 text-white shadow-sm">
                <Lightbulb className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">InnofairUz</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Mintaqaviy innovatsion yarmarka platformasi: tadbirlar, loyihalar va hamkorlik imkoniyatlari yagona ekotizimda.
            </p>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" data-testid="button-facebook">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" data-testid="button-linkedin">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" data-testid="button-twitter">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" data-testid="button-telegram">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Tezkor havolalar</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" data-testid="link-footer-home">
                  <Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                    Bosh sahifa
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/tadbirlar" data-testid="link-footer-events">
                  <Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                    Tadbirlar taqvimi
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/investorlar" data-testid="link-footer-investors">
                  <Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                    Investorlar va sheriklar
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/hamkorlik" data-testid="link-footer-collaboration">
                  <Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                    Hamkorlik va fikrlar
                  </Button>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Platforma yo'nalishlari</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                  Innovatsion loyihalar
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                  Investitsiya takliflari
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                  Tijorat mahsulotlari
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                  Hududiy muammolar
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                  Hamkorlik maydoni
                </Button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Yangiliklar obunasi</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Yarmarka yangiliklari va yangi hamkorlik takliflaridan xabardor bo'ling
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Email manzilingiz"
                data-testid="input-newsletter"
              />
              <Button data-testid="button-subscribe">Obuna</Button>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 InnofairUz. Barcha huquqlar himoyalangan. Ishlab chiquvchi: SAYD.X</p>
        </div>
      </div>
    </footer>
  );
}
