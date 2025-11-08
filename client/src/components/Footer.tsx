import { Link } from "wouter";
import { Facebook, Linkedin, Twitter, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-lg">
                I
              </div>
              <span className="text-xl font-bold">InnovaUz</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              O'zbekiston va jahon miqyosidagi innovatsion ishlanmalar, ixtirolar va ilmiy g'oyalar portali
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
                <Link href="/innovatsiyalar" data-testid="link-footer-innovations">
                  <Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                    Innovatsiyalar
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/maqolalar" data-testid="link-footer-articles">
                  <Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                    Maqolalar
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/yangiliklar" data-testid="link-footer-news">
                  <Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                    Yangiliklar
                  </Button>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Turkumlar</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                  Texnologiya
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                  Tibbiyot
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                  Ta'lim
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                  Energetika
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                  Startap
                </Button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Yangiliklar obunasi</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Eng so'nggi innovatsiyalar haqida xabardor bo'ling
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
          <p>&copy; 2025 InnovaUz. Barcha huquqlar himoyalangan. Ishlab chiquvchi: SAYD.X</p>
        </div>
      </div>
    </footer>
  );
}
