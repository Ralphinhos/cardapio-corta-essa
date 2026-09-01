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
import { MetaTrackedLink } from "@/app/meta-tracked-link";
import { VipWhatsAppButton } from "@/app/vip-whatsapp-button";
import styles from "./clube.module.css";

export const metadata: Metadata = {
  title: "Clube Corta Essa! | Assinaturas Brasa, Marmitas e 360°",
  description:
    "Escolha entre Assinatura Brasa, Assinatura Marmitas ou a experiência 360°, reunindo churrasco vegetariano e Linha Rotina em Poços de Caldas.",
};

type Plan = {
  id: string;
  level: string;
  name: string;
  badge: string;
  profile: string;
  price: number;
  summary: string;
  saving: number;
  comparison: string;
  extraSaving?: string;
  featured?: boolean;
  benefits: string[];
};

const plans: Plan[] = [
  {
    id: "assinatura-brasa",
    level: "Plano 01",
    name: "Assinatura Brasa",
    badge: "Brasa",
    profile: "A experiência da grelha reservada para o seu mês.",
    price: 179,
    summary: "4 kits Brasa + Divine Flour",
    saving: 7,
    comparison: "Valor avulso no Pix de referência: R$ 186",
    benefits: [
      "4 kits Brasa à escolha por mês",
      "1 Divine Flour de 150 g",
      "Reserva mensal dos sabores escolhidos",
      "Atendimento individual pelo WhatsApp",
    ],
  },
  {
    id: "assinatura-marmitas",
    level: "Plano 02",
    name: "Assinatura Marmitas",
    badge: "Rotina",
    profile: "Comida de verdade pronta para acompanhar os dias corridos.",
    price: 519,
    summary: "20 marmitas por ciclo",
    saving: 10,
    comparison: "20 refeições avulsas no Pix: R$ 529",
    benefits: [
      "20 marmitas gourmet congeladas",
      "Combinação livre entre os três sabores",
      "Prioridade na produção da Linha Rotina",
      "Atendimento individual pelo WhatsApp",
    ],
  },
  {
    id: "assinatura-360",
    level: "Plano 03",
    name: "Assinatura 360°",
    badge: "Completa",
    profile: "Brasa e Rotina juntas para viver o Corta Essa por inteiro.",
    price: 669,
    summary: "Brasa + 20 marmitas por ciclo",
    saving: 46,
    comparison: "Compra avulsa equivalente no Pix: R$ 715",
    extraSaving: "Também R$ 29 abaixo das duas assinaturas separadas",
    featured: true,
    benefits: [
      "4 kits Brasa à escolha por mês",
      "1 Divine Flour de 150 g",
      "20 marmitas com sabores combináveis",
      "Uma única confirmação para as duas linhas",
      "Prioridade máxima de produção e atendimento",
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

function ChampionMedal() {
  return (
    <span className={styles.championMedal} aria-label="Assinatura 360°, plano mais completo">
      <span className={styles.championMedalRibbons} aria-hidden="true" />
      <span className={styles.championMedalRosette} aria-hidden="true">
        <span className={styles.championMedalSeal}>
          <Flame />
          <strong>360°</strong>
          <span>mais completo</span>
        </span>
      </span>
    </span>
  );
}

export default function ClubPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} id="inicio">
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
            <Link href="/">Brasa</Link>
            <Link href="/rotina">Rotina</Link>
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
              <span>Brasa.</span>
              <span>Rotina.</span>
              <span>Todo mês.</span>
            </h1>
            <p>
              Escolha uma linha ou viva a experiência completa: churrasco
              vegetariano e marmitas gourmet reservados no mesmo ciclo.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#planos">
                <Flame aria-hidden="true" />
                Conhecer os planos
                <span aria-hidden="true">↓</span>
              </a>
              <MetaTrackedLink
                className={styles.secondaryAction}
                href={clubWhatsAppUrl()}
                target="_blank"
                rel="noreferrer"
                metaEvent="Contact"
                metaParameters={{
                  content_name: "Clube Corta Essa",
                  content_category: "Clube de assinaturas",
                }}
              >
                Falar sobre o Clube <span aria-hidden="true">↗</span>
              </MetaTrackedLink>
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
                src="/images/rotina/parmegiana-transparent.webp"
                width="937"
                height="1678"
                alt=""
                decoding="async"
              />
            </div>
            <div className={styles.priceSeal}>
              <span>A partir de</span>
              <strong>R$ 179</strong>
              <span>no Pix · por mês</span>
            </div>
            <span className={styles.visualCaption}>Brasa + Rotina</span>
          </div>
        </div>
      </section>

      <section className={styles.promiseBar} aria-label="Benefícios principais">
        <div>
          <strong>BRASA · ROTINA · 360°</strong>
          <span>Três formas de pertencer</span>
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
          <h2 id="club-intro-title">É o Corta Essa presente nos seus dias.</h2>
          <p>
            A cada ciclo, você escolhe seus kits Brasa, suas marmitas ou os dois.
            O Corta Essa reserva, prepara e organiza tudo em uma experiência
            artesanal, próxima e previsível.
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
            <p className={styles.kicker}>Escolha sua experiência</p>
            <h2 id="plans-title">Qual Corta Essa combina com o seu mês?</h2>
          </div>
          <p>
            Assine Brasa ou Marmitas separadamente — ou reúna as duas linhas no
            360°, com valor inferior à soma dos planos individuais.
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
                {plan.featured ? (
                  <ChampionMedal />
                ) : (
                  <span>{plan.badge}</span>
                )}
              </div>
              <div className={styles.planTitle}>
                <h3>{plan.name}</h3>
                <p>{plan.profile}</p>
              </div>
              <div className={styles.planPrice}>
                <span>{plan.summary}</span>
                <div>
                  <strong>{money(plan.price)}</strong>
                  <span>/ mês · no Pix</span>
                </div>
                <div className={styles.planSaving}>
                  <b>Economize {money(plan.saving)}</b>
                  <span>{plan.comparison}</span>
                  {plan.extraSaving && <small>{plan.extraSaving}</small>}
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
              <MetaTrackedLink
                href={clubWhatsAppUrl(plan.name)}
                target="_blank"
                rel="noreferrer"
                aria-label={`Quero assinar o ${plan.name}`}
                metaEvent="InitiateCheckout"
                metaParameters={{
                  content_name: plan.name,
                  content_category: "Clube de assinaturas",
                  content_ids: [
                    plan.id,
                  ],
                  content_type: "product",
                  currency: "BRL",
                  num_items: 1,
                  value: plan.price,
                }}
                secondaryMetaEvent="Contact"
                secondaryMetaParameters={{
                  content_name: plan.name,
                  content_category: "Clube de assinaturas",
                }}
              >
                Quero este plano <ChevronRight aria-hidden="true" />
              </MetaTrackedLink>
            </article>
          ))}
        </div>

        <p className={styles.planFootnote}>
          Adesão formalizada por contrato e sujeita à disponibilidade de vagas.
          Datas e taxa de entrega são confirmadas individualmente pelo WhatsApp.
          Também aceitamos crédito e débito. O valor final, com as taxas da
          operadora, será informado antes da confirmação do pedido.
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
            <h3>Escolha sua experiência</h3>
            <p>
              Selecione Brasa, Marmitas ou 360° e confirme o contrato e o
              pagamento com a equipe Corta Essa.
            </p>
          </li>
          <li>
            <span>02</span>
            <PackageCheck aria-hidden="true" />
            <h3>Defina suas escolhas</h3>
            <p>
              Envie os sabores dos kits Brasa e a combinação de marmitas prevista
              no seu plano.
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
              Os produtos do ciclo chegam organizados para a sua rotina e para os
              próximos momentos de grelha.
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
            <img
              src="/images/rotina/parmegiana-transparent.webp"
              width="937"
              height="1678"
              alt=""
              loading="lazy"
            />
          </div>
        </div>
        <div className={styles.choiceCopy}>
          <div className={`${styles.sectionMarker} ${styles.sectionMarkerLight}`}>
            <span>04</span> / Liberdade de escolha
          </div>
          <p className={styles.kicker}>Seu plano, suas escolhas</p>
          <h2 id="choice-title">Da grelha aos dias corridos.</h2>
          <p>
            Escolha os sabores Brasa e combine livremente as receitas da Linha
            Rotina. No 360°, as duas experiências são confirmadas juntas e
            reservadas antes da venda avulsa.
          </p>
          <Link href="/rotina">
            Conhecer também a Linha Rotina <span aria-hidden="true">↗</span>
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
              Sim. Na Brasa, você escolhe os kits disponíveis no ciclo. Nas
              Marmitas, combine livremente os três sabores da Linha Rotina.
            </p>
          </details>
          <details>
            <summary>O que acontece se eu não enviar minha escolha?</summary>
            <p>
              A Seleção do Mestre entra em ação: montamos um mix variado dentro
              da composição do seu plano para você não perder o ciclo.
            </p>
          </details>
          <details>
            <summary>Como funciona a entrega?</summary>
            <p>
              As rotas dos kits são programadas para todos os domingos em Poços
              de Caldas. Para entregas individuais, consulte taxa,
              disponibilidade e horário diretamente pelo WhatsApp. Frete grátis
              para pedidos acima de R$ 200.
            </p>
          </details>
          <details>
            <summary>A assinatura possui permanência mínima?</summary>
            <p>
              Sim. A adesão é formalizada por contrato, com permanência mínima de
              três ciclos mensais. As condições completas são apresentadas antes
              da confirmação.
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
          <h2 id="final-cta-title">Brasa e rotina podem caminhar juntas.</h2>
          <p>
            Escolha uma linha ou entre no 360° para viver a experiência completa
            do Corta Essa todos os meses.
          </p>
        </div>
        <MetaTrackedLink
          href={clubWhatsAppUrl()}
          target="_blank"
          rel="noreferrer"
          metaEvent="Contact"
          metaParameters={{
            content_name: "Clube Corta Essa",
            content_category: "Clube de assinaturas",
          }}
        >
          Quero entrar para o Clube <ChevronRight aria-hidden="true" />
        </MetaTrackedLink>
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
            <strong>Da brasa à rotina. Comida de verdade, todo mês.</strong>
          </div>
          <nav aria-label="Navegação do rodapé">
            <span>Navegue</span>
            <Link href="/">Início</Link>
            <Link href="/#cardapio">Cardápio</Link>
            <Link href="/rotina">Linha Rotina</Link>
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
      <VipWhatsAppButton />
    </main>
  );
}
