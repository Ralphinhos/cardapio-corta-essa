/* eslint-disable @next/next/no-img-element -- Product assets are pre-optimized WebP files. */

import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  Check,
  ChevronRight,
  Flame,
  MapPin,
  PackageCheck,
  Sparkles,
  Truck,
  WalletCards,
} from "lucide-react";
import { whatsappNumber } from "@/lib/catalog";
import styles from "./clube.module.css";

export const metadata: Metadata = {
  title: "Clube Corta Essa! | Churrasco vegetariano todo mês",
  description:
    "Escolha 2, 4 ou 8 kits por mês e tenha seu churrasco vegetariano reservado, com benefícios exclusivos e entrega em Poços de Caldas.",
};

type Plan = {
  level: string;
  name: string;
  profile: string;
  price: number;
  retailPrice: number;
  featured?: boolean;
  benefits: string[];
};

const plans: Plan[] = [
  {
    level: "Nível 01",
    name: "Clube Entusiasta",
    profile: "Para quem acende a brasa duas vezes no mês.",
    price: 79,
    retailPrice: 84,
    benefits: [
      "2 kits gourmet à escolha por mês",
      "10% de desconto em pedidos extras",
      "Reserva mensal dos sabores escolhidos",
    ],
  },
  {
    level: "Nível 02",
    name: "Mestre Churrasqueiro",
    profile: "Um kit por semana para ter sempre à mão.",
    price: 159,
    retailPrice: 186,
    featured: true,
    benefits: [
      "4 kits gourmet à escolha por mês",
      "1 Divine Flour de 150 g",
      "Frete grátis em Poços de Caldas",
      "Reserva prioritária de produtos",
    ],
  },
  {
    level: "Nível 03",
    name: "Anfitrião Premium",
    profile: "Para famílias, anfitriões e encontros maiores.",
    price: 299,
    retailPrice: 371,
    benefits: [
      "8 kits gourmet à escolha por mês",
      "1 Kit Divine Flour completo (2 × 150 g)",
      "Frete grátis em Poços de Caldas",
      "Degustação VIP de lançamentos",
    ],
  },
];

const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);

const clubWhatsAppUrl = (plan?: string) => {
  const message = plan
    ? `Olá! Quero assinar o ${plan} do Clube Corta Essa. Pode me explicar como confirmar minha vaga?`
    : "Olá! Quero conhecer e assinar o Clube Corta Essa. Pode me explicar os planos?";

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
};

export default function ClubPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} id="inicio">
        <img
          className={styles.heroGhostWord}
          src="/images/mensal-type.webp"
          width="1600"
          height="800"
          alt=""
          aria-hidden="true"
          decoding="async"
        />
        <header className={styles.header}>
          <Link className={styles.logo} href="/" aria-label="Voltar ao cardápio Corta Essa!">
            <img
              src="/images/logo-transparent.webp"
              width="360"
              height="219"
              alt="Corta Essa! Churrasco Vegetariano"
            />
          </Link>
          <nav aria-label="Navegação do Clube">
            <Link href="/#cardapio">Cardápio</Link>
            <a href="#como-funciona">Como funciona</a>
            <a className={styles.headerCta} href="#planos">Ver planos</a>
          </nav>
        </header>

        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>
              <span aria-hidden="true" />
              Clube Corta Essa! · somente 40 vagas
            </div>
            <h1>
              <span>Sua brasa.</span>
              <span>Todo mês.</span>
            </h1>
            <p>
              Escolha 2, 4 ou 8 kits e tenha seus sabores favoritos reservados
              para receber em casa. Sem improviso. Sem churrasco sem graça.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#planos">
                <Flame aria-hidden="true" />
                Conhecer os planos
                <span aria-hidden="true">↓</span>
              </a>
              <a
                className={styles.secondaryAction}
                href={clubWhatsAppUrl()}
                target="_blank"
                rel="noreferrer"
              >
                Falar sobre o Clube <span aria-hidden="true">↗</span>
              </a>
            </div>
            <div className={styles.heroNote}>
              <MapPin aria-hidden="true" />
              Assinaturas com entrega em Poços de Caldas
            </div>
          </div>

          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.heroHalo} />
            <div className={`${styles.productFrame} ${styles.productFrameMain}`}>
              <img
                src="/images/creamy-kit.webp"
                width="567"
                height="660"
                alt=""
                fetchPriority="high"
              />
            </div>
            <div className={`${styles.productFrame} ${styles.productFrameLeft}`}>
              <img
                src="/images/petite-kit.webp"
                width="567"
                height="660"
                alt=""
                decoding="async"
              />
            </div>
            <div className={`${styles.productFrame} ${styles.productFrameRight}`}>
              <img
                src="/images/divine-kit.webp"
                width="660"
                height="660"
                alt=""
                decoding="async"
              />
            </div>
            <div className={styles.priceSeal}>
              <span>A partir de</span>
              <strong>R$ 79</strong>
              <span>por mês</span>
            </div>
            <span className={styles.visualCaption}>Escolha mensal</span>
          </div>
        </div>
      </section>

      <section className={styles.promiseBar} aria-label="Benefícios principais">
        <div>
          <strong>02 · 04 · 08</strong>
          <span>Kits reservados por mês</span>
        </div>
        <div>
          <PackageCheck aria-hidden="true" />
          <span>Prioridade para assinantes</span>
        </div>
        <div>
          <Truck aria-hidden="true" />
          <span>Entregas em rotas programadas</span>
        </div>
      </section>

      <section className={styles.intro} aria-labelledby="club-intro-title">
        <div className={styles.sectionMarker}>
          <span>01</span> / O Clube
        </div>
        <div className={styles.introCopy}>
          <p className={styles.kicker}>Não é uma caixa surpresa.</p>
          <h2 id="club-intro-title">É o seu churrasco já garantido.</h2>
          <p>
            A cada ciclo, você escolhe os kits que quer receber. Confirmou a
            seleção? A Corta Essa reserva, prepara e entrega na rota do mês.
          </p>
        </div>
        <aside className={styles.masterSelection}>
          <Sparkles aria-hidden="true" />
          <span>Sem tempo para escolher?</span>
          <h3>Deixe com a Seleção do Mestre.</h3>
          <p>
            Se você não enviar suas escolhas no prazo, montamos uma seleção
            variada com os sabores disponíveis no ciclo.
          </p>
        </aside>
      </section>

      <section className={styles.plans} id="planos" aria-labelledby="plans-title">
        <div className={styles.plansHeading}>
          <div className={`${styles.sectionMarker} ${styles.sectionMarkerLight}`}>
            <span>02</span> / Planos mensais
          </div>
          <div>
            <p className={styles.kicker}>Escolha seu ritmo</p>
            <h2 id="plans-title">Quanto de brasa cabe no seu mês?</h2>
          </div>
          <p>
            Todos os planos permitem escolher os sabores do ciclo e garantem a
            reserva dos produtos antes da venda avulsa.
          </p>
        </div>

        <div className={styles.planGrid}>
          {plans.map((plan) => (
            <article
              className={`${styles.planCard}${plan.featured ? ` ${styles.planCardFeatured}` : ""}`}
              key={plan.name}
            >
              <div className={styles.planTopline}>
                <span>{plan.level}</span>
                {!plan.featured && <span>Clube</span>}
              </div>
              {plan.featured && (
                <img
                  className={styles.featuredMedal}
                  src="/images/club-champion-medal.webp"
                  width="512"
                  height="512"
                  loading="lazy"
                  decoding="async"
                  alt="Campeão de vendas"
                />
              )}
              <div
                className={`${styles.planTitle}${plan.featured ? ` ${styles.planTitleFeatured}` : ""}`}
              >
                <h3>{plan.name}</h3>
                <p>{plan.profile}</p>
              </div>
              <div className={styles.planPrice}>
                <span>de {money(plan.retailPrice)} avulso por</span>
                <div>
                  <strong>{money(plan.price)}</strong>
                  <span>/ mês</span>
                </div>
              </div>
              <ul>
                {plan.benefits.map((benefit) => (
                  <li key={benefit}>
                    <Check aria-hidden="true" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <a
                href={clubWhatsAppUrl(plan.name)}
                target="_blank"
                rel="noreferrer"
                aria-label={`Quero assinar o ${plan.name}`}
              >
                Quero este plano <ChevronRight aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>

        <p className={styles.planFootnote}>
          Adesão sujeita à disponibilidade de vagas. Datas, taxa de entrega do
          plano Entusiasta e forma de pagamento são confirmadas no atendimento.
        </p>
      </section>

      <section
        className={styles.howItWorks}
        id="como-funciona"
        aria-labelledby="how-title"
      >
        <div className={styles.howHeading}>
          <div className={styles.sectionMarker}>
            <span>03</span> / Seu ciclo
          </div>
          <div>
            <p className={styles.kicker}>Simples para você. Previsível para a brasa.</p>
            <h2 id="how-title">Do plano à porta da sua casa.</h2>
          </div>
        </div>

        <ol className={styles.steps}>
          <li>
            <span>01</span>
            <WalletCards aria-hidden="true" />
            <h3>Confirme seu plano</h3>
            <p>
              Escolha o nível ideal e confirme a assinatura e o pagamento com a
              equipe Corta Essa.
            </p>
          </li>
          <li>
            <span>02</span>
            <PackageCheck aria-hidden="true" />
            <h3>Escolha seus kits</h3>
            <p>
              Com o ciclo liberado, envie os sabores do mês dentro da quantidade
              do seu plano.
            </p>
          </li>
          <li>
            <span>03</span>
            <CalendarDays aria-hidden="true" />
            <h3>Reserve a data</h3>
            <p>
              As opções de entrega são organizadas em rotas fixas e informadas a
              cada ciclo.
            </p>
          </li>
          <li>
            <span>04</span>
            <Truck aria-hidden="true" />
            <h3>Receba em casa</h3>
            <p>
              Seus kits chegam prontos para armazenar, preparar e transformar o
              próximo encontro.
            </p>
          </li>
        </ol>
      </section>

      <section className={styles.choice} aria-labelledby="choice-title">
        <div className={styles.choiceVisual} aria-hidden="true">
          <span className={styles.choiceWord}>ESCOLHA</span>
          <div className={`${styles.choiceProduct} ${styles.choiceProductOne}`}>
            <img src="/images/persian-kit.webp" width="535" height="660" alt="" loading="lazy" />
          </div>
          <div className={`${styles.choiceProduct} ${styles.choiceProductTwo}`}>
            <img src="/images/tropical-kit.webp" width="567" height="660" alt="" loading="lazy" />
          </div>
        </div>
        <div className={styles.choiceCopy}>
          <div className={`${styles.sectionMarker} ${styles.sectionMarkerLight}`}>
            <span>04</span> / Liberdade de escolha
          </div>
          <p className={styles.kicker}>Seu plano, seus sabores</p>
          <h2 id="choice-title">Você escolhe o que vai para a grelha.</h2>
          <p>
            Creamy Orange, Petite Zucchini, Persian Barbecue, Turkish Skewer e
            outros kits ativos no ciclo entram na seleção. A disponibilidade do
            assinante é reservada antes da venda avulsa.
          </p>
          <Link href="/#cardapio">
            Explorar sabores do cardápio <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section className={styles.faq} aria-labelledby="faq-title">
        <div className={styles.faqHeading}>
          <div className={styles.sectionMarker}>
            <span>05</span> / Dúvidas rápidas
          </div>
          <div>
            <p className={styles.kicker}>Antes de entrar para o Clube</p>
            <h2 id="faq-title">O que você precisa saber.</h2>
          </div>
        </div>
        <div className={styles.faqList}>
          <details>
            <summary>Posso escolher os sabores todos os meses?</summary>
            <p>
              Sim. Você escolhe a quantidade de kits prevista no seu plano entre
              os produtos disponíveis naquele ciclo.
            </p>
          </details>
          <details>
            <summary>O que acontece se eu não enviar minha escolha?</summary>
            <p>
              A Seleção do Mestre entra em ação: montamos um mix variado dentro
              da quantidade do seu plano para você não perder o ciclo.
            </p>
          </details>
          <details>
            <summary>Como funcionam as entregas?</summary>
            <p>
              O atendimento é somente por entrega em Poços de Caldas, com datas
              agrupadas em rotas fixas. Os planos Mestre e Anfitrião têm frete
              grátis; no Entusiasta, a taxa é confirmada no atendimento.
            </p>
          </details>
          <details>
            <summary>Como confirmo a assinatura?</summary>
            <p>
              Toque em “Quero este plano”. A equipe confirma sua vaga, a forma de
              pagamento e as datas do primeiro ciclo pelo WhatsApp.
            </p>
          </details>
        </div>
      </section>

      <section className={styles.finalCta} aria-labelledby="final-cta-title">
        <div className={styles.finalCtaGhost} aria-hidden="true">CLUBE</div>
        <div>
          <span>Primeira turma · 40 assinantes</span>
          <h2 id="final-cta-title">A próxima brasa já pode estar garantida.</h2>
          <p>
            Entre para o Clube Corta Essa e tenha sabor, variedade e prioridade
            todos os meses.
          </p>
        </div>
        <a href={clubWhatsAppUrl()} target="_blank" rel="noreferrer">
          Quero entrar para o Clube <ChevronRight aria-hidden="true" />
        </a>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <img
              src="/images/logo-transparent.webp"
              width="360"
              height="219"
              loading="lazy"
              alt="Corta Essa!"
            />
            <strong>Churrasco vegetariano de verdade. Todo mês.</strong>
          </div>
          <nav aria-label="Navegação do rodapé">
            <span>Navegue</span>
            <Link href="/">Início</Link>
            <Link href="/#cardapio">Cardápio</Link>
            <a href="#planos">Planos do Clube</a>
          </nav>
          <div className={styles.footerContact}>
            <span>Fale com a gente</span>
            <a href="tel:+5535910222015">(35) 91022-2015</a>
            <a
              href="https://www.instagram.com/cortaessachurrascovegetariano/"
              target="_blank"
              rel="noreferrer"
            >
              @cortaessachurrascovegetariano
            </a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>Imagens meramente ilustrativas.</span>
          <a href="#inicio">Voltar ao topo ↑</a>
        </div>
      </footer>
    </main>
  );
}
