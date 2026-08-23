/* eslint-disable @next/next/no-img-element -- Product photography is pre-optimized WebP from the official catalog. */

import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  Check,
  ChefHat,
  ChevronRight,
  Clock3,
  Flame,
  HeartHandshake,
  Leaf,
  MessageCircle,
  PackageCheck,
  PackageX,
  Snowflake,
  Sparkles,
  Truck,
} from "lucide-react";
import { MetaTrackedLink } from "@/app/meta-tracked-link";
import { VipWhatsAppButton } from "@/app/vip-whatsapp-button";
import {
  productImageUrl,
  stockAvailabilityLabel,
  whatsappNumber,
} from "@/lib/catalog";
import { getRoutineProducts } from "@/lib/catalog-server";
import { RotinaKitBuilder } from "./rotina-kit-builder";
import styles from "./rotina.module.css";

export const metadata: Metadata = {
  title: "Linha Rotina | Corta Essa!",
  description:
    "Marmitas vegetarianas gourmet congeladas de 380 g para uma rotina prática, saudável e cheia de sabor. Monte kits de 1, 5 ou 20 em Poços de Caldas.",
};

export const dynamic = "force-dynamic";

const flavorTones = ["lime", "orange", "paper"] as const;

const ingredientList = (description: string) =>
  description
    .split(/\r?\n|,\s*/)
    .map((ingredient) => ingredient.trim())
    .filter(Boolean);

const whatsappMessageUrl = (message: string) =>
  `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

export default async function RotinaPage() {
  const routineProducts = (await getRoutineProducts()).toSorted(
    (first, second) =>
      first.displayOrder - second.displayOrder ||
      first.name.localeCompare(second.name),
  );
  const repeatOrderUrl = whatsappMessageUrl(
    "Olá! Já sou cliente da Corta Essa e quero repetir meu pedido da Linha Rotina. Podemos consultar minha última composição?",
  );

  return (
    <main className={styles.page}>
      <section className={styles.hero} id="inicio">
        <header className={styles.header}>
          <Link className={styles.logo} href="/" aria-label="Corta Essa! — início">
            <img
              src="/images/logo-transparent.webp"
              width="360"
              height="219"
              alt="Corta Essa! Churrasco Vegetariano"
            />
          </Link>
          <nav aria-label="Navegação da Linha Rotina">
            <Link href="/#cardapio">Brasa</Link>
            <a href="#sabores">Sabores</a>
            <a href="#kits">Kits</a>
            <Link className={styles.headerCta} href="/clube">
              <Flame aria-hidden="true" />
              Clube
            </Link>
          </nav>
        </header>

        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>
              <span aria-hidden="true" />
              MARMITAS GOURMET CONGELADAS - LINHA ROTINA
            </div>
            <h1>
              <span>Comida de</span>
              <span>verdade.</span>
              <span>Para dias corridos.</span>
            </h1>
            <p>
              Refeições vegetarianas de 380 g, feitas artesanalmente para quem
              quer praticidade sem abrir mão de sabor, textura e prazer à mesa.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#kits">
                <PackageCheck aria-hidden="true" />
                Montar meu kit
                <span aria-hidden="true">↓</span>
              </a>
              <a className={styles.secondaryAction} href="#sabores">
                Conhecer os sabores <span aria-hidden="true">↗</span>
              </a>
            </div>
            <div className={styles.heroProof}>
              <span><Snowflake aria-hidden="true" /> Congeladas</span>
              <span><ChefHat aria-hidden="true" /> Artesanais</span>
              <span><Leaf aria-hidden="true" /> Vegetarianas</span>
            </div>
          </div>

          <div className={styles.heroVisual} aria-hidden="true">
            <span className={styles.heroWord}>ROTINA</span>
            <div className={styles.heroHalo} />
            <div className={styles.heroFrame}>
              <img
                src="/images/rotina/hero-person.webp"
                width="857"
                height="1536"
                alt=""
                fetchPriority="high"
              />
            </div>
            <div className={styles.heroSeal}>
              <strong>380 g</strong>
              <span>por refeição</span>
            </div>
            <span className={styles.heroNote}>Feitas em pequenos lotes</span>
          </div>
        </div>
      </section>

      <section className={styles.promiseBar} aria-label="Diferenciais da Linha Rotina">
        <div>
          <strong>{String(routineProducts.length).padStart(2, "0")}</strong>
          <span>sabores para combinar</span>
        </div>
        <div>
          <Clock3 aria-hidden="true" />
          <span>Prontas em poucos minutos</span>
        </div>
        <div>
          <Truck aria-hidden="true" />
          <span>Rotas aos domingos em Poços</span>
        </div>
      </section>

      <section className={styles.intro} aria-labelledby="rotina-intro-title">
        <div className={styles.sectionMarker}>
          <span>01</span> / Uma nova rotina
        </div>
        <div className={styles.introCopy}>
          <p className={styles.kicker}>PRÁTICA E SAUDÁVEL</p>
          <h2 id="rotina-intro-title">
            Seu dia pode ser corrido. Sua comida não precisa ter pressa.
          </h2>
          <p>
            A Linha Rotina leva a técnica e o cuidado da Corta Essa para o prato
            de todos os dias. Comida vegetal completa, generosa e cheia de
            personalidade — feita para alimentar bem e dar vontade de repetir.
          </p>
        </div>
        <aside className={styles.introAside}>
          <Sparkles aria-hidden="true" />
          <span>Do churrasco ao dia a dia</span>
          <strong>O mesmo cuidado. Uma nova ocasião.</strong>
          <p>
            Produção artesanal, escolha de ingredientes e atendimento próximo em
            todas as etapas.
          </p>
        </aside>
      </section>

      <section className={styles.flavors} id="sabores" aria-labelledby="flavors-title">
        <div className={styles.flavorsHeading}>
          <div className={`${styles.sectionMarker} ${styles.sectionMarkerLight}`}>
            <span>02</span> / Os pratos
          </div>
          <div>
            <p className={styles.kicker}>RECEITAS SABOROSAS E ESPECIAIS</p>
            <h2 id="flavors-title">Escolha seus sabores favoritos.</h2>
          </div>
          <p>
            No Kit 5 e no Kit 20, você distribui as quantidades como preferir.
            Misture os sabores disponíveis ou repita aquele que já ganhou seu
            paladar.
          </p>
        </div>

        {routineProducts.length > 0 ? (
          <div className={styles.flavorGrid}>
          {routineProducts.map((flavor, index) => {
            const outOfStock =
              flavor.stockQuantity != null && flavor.stockQuantity <= 0;
            return (
            <article
              className={`${styles.flavorCard} ${styles[`flavorCard_${flavorTones[index % flavorTones.length]}`]}${outOfStock ? ` ${styles.flavorCardSoldOut}` : ""}`}
              key={flavor.key}
            >
              <div className={styles.flavorVisual}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <img
                  src={productImageUrl(flavor.imagePath)}
                  width="768"
                  height="1376"
                  alt={`Produto da Linha Rotina: ${flavor.name}`}
                  loading="lazy"
                  decoding="async"
                />
                <strong>{flavor.badgeText ?? "Vegetariano"}</strong>
                {outOfStock ? (
                  <em className={styles.flavorStock}>
                    <PackageX aria-hidden="true" /> Indisponível
                  </em>
                ) : flavor.stockQuantity != null ? (
                  <em className={styles.flavorStock}>
                    <PackageCheck aria-hidden="true" />
                    {stockAvailabilityLabel(flavor.stockQuantity)}
                  </em>
                ) : null}
              </div>
              <div className={styles.flavorContent}>
                <span>{flavor.weight}</span>
                <h3>{flavor.name}</h3>
                <ul>
                  {ingredientList(flavor.description).map((ingredient) => (
                    <li key={ingredient}>{ingredient}</li>
                  ))}
                </ul>
                {flavor.detail && <p>{flavor.detail}</p>}
              </div>
            </article>
          )})}
          </div>
        ) : (
          <div className={styles.flavorEmpty}>
            <PackageX aria-hidden="true" />
            <h3>Novos sabores em preparação</h3>
            <p>Fale com a equipe para consultar a próxima produção.</p>
          </div>
        )}
      </section>

      <section className={styles.kits} id="kits" aria-labelledby="kits-title">
        <div className={styles.kitsHeading}>
          <div className={`${styles.sectionMarker} ${styles.sectionMarkerLight}`}>
            <span>03</span> / Escolha seu kit
          </div>
          <div>
            <p className={styles.kicker}>Do primeiro prato à rotina completa</p>
            <h2 id="kits-title">Quanto de tranquilidade cabe no seu freezer?</h2>
          </div>
          <p>
            Três portas de entrada para a mesma experiência. O Kit 20 entrega o
            melhor valor por refeição e resolve mais dias de uma só vez.
          </p>
        </div>

        <RotinaKitBuilder
          flavors={routineProducts.map((product) => ({
            key: product.key,
            name: product.name,
            price: product.price,
            stockQuantity: product.stockQuantity,
          }))}
        />
        <p className={styles.purchaseNote}>
          <Check aria-hidden="true" /> Todos os kits desta página são compras
          avulsas, sem renovação automática ou assinatura.
        </p>
      </section>

      <section className={styles.value} aria-labelledby="value-title">
        <div className={styles.valueHeading}>
          <div className={styles.sectionMarker}>
            <span>04</span> / O valor está no cuidado
          </div>
          <div>
            <p className={styles.kicker}>Antes do preço, vem a experiência</p>
            <h2 id="value-title">Feita por pessoas. Para pessoas.</h2>
          </div>
        </div>

        <div className={styles.valueGrid}>
          <article>
            <ChefHat aria-hidden="true" />
            <span>01</span>
            <h3>Excelência artesanal</h3>
            <p>
              Receitas preparadas em pequenos lotes, com atenção ao sabor, à
              textura e ao acabamento de cada refeição.
            </p>
          </article>
          <article>
            <HeartHandshake aria-hidden="true" />
            <span>02</span>
            <h3>Atendimento individual</h3>
            <p>
              A escolha acontece em conversa com a equipe, respeitando sua
              preferência e acompanhando sua experiência.
            </p>
          </article>
          <article>
            <Leaf aria-hidden="true" />
            <span>03</span>
            <h3>Alimentação com prazer</h3>
            <p>
              Saúde sem culpa ou restrição: comida variada, satisfatória e feita
              para ocupar o lugar principal à mesa.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.howItWorks} aria-labelledby="how-title">
        <div className={styles.howHeading}>
          <div className={styles.sectionMarker}>
            <span>05</span> / Da escolha à sua porta
          </div>
          <div>
            <p className={styles.kicker}>Prático sem perder proximidade</p>
            <h2 id="how-title">Sua semana garantida em três movimentos.</h2>
          </div>
        </div>
        <ol>
          <li>
            <span>01</span>
            <PackageCheck aria-hidden="true" />
            <h3>Monte seu kit</h3>
            <p>Escolha 1, 5 ou 20 refeições e distribua seus sabores.</p>
          </li>
          <li>
            <span>02</span>
            <ChefHat aria-hidden="true" />
            <h3>A gente prepara</h3>
            <p>Seu pedido entra na produção artesanal da rota combinada.</p>
          </li>
          <li>
            <span>03</span>
            <CalendarDays aria-hidden="true" />
            <h3>Você recebe</h3>
            <p>Entregas programadas aos domingos em Poços de Caldas.</p>
          </li>
        </ol>
      </section>

      <section className={styles.community} aria-labelledby="community-title">
        <div className={styles.communityGhost} aria-hidden="true">PERTENCER</div>
        <div className={styles.communityCopy}>
          <div className={`${styles.sectionMarker} ${styles.sectionMarkerLight}`}>
            <span>06</span> / A conversa continua
          </div>
          <p className={styles.kicker}>Uma marca que escuta</p>
          <h2 id="community-title">Sua experiência ajuda a criar o próximo prato.</h2>
          <p>
            Queremos saber o que funcionou, qual sabor virou favorito e o que
            pode melhorar. É assim que conteúdo, conversa e comunidade voltam
            para a cozinha — sempre com integridade.
          </p>
          <div className={styles.communityActions}>
            <MetaTrackedLink
              href={repeatOrderUrl}
              target="_blank"
              rel="noreferrer"
              metaEvent="Contact"
              metaParameters={{
                content_name: "Repetir pedido Linha Rotina",
                content_category: "Retenção",
              }}
            >
              <MessageCircle aria-hidden="true" /> Já sou cliente
              <ChevronRight aria-hidden="true" />
            </MetaTrackedLink>
            <span>O Grupo VIP fica sempre disponível no canto da página.</span>
          </div>
        </div>
        <div className={styles.communityCycle} aria-label="Como a Corta Essa evolui com a comunidade">
          <div><strong>01</strong><span>Você prova</span></div>
          <div><strong>02</strong><span>A gente conversa</span></div>
          <div><strong>03</strong><span>A cozinha evolui</span></div>
        </div>
      </section>

      <section className={styles.faq} aria-labelledby="faq-title">
        <div className={styles.faqHeading}>
          <div className={styles.sectionMarker}>
            <span>07</span> / Dúvidas sem rodeio
          </div>
          <div>
            <p className={styles.kicker}>Antes de montar seu kit</p>
            <h2 id="faq-title">O que você precisa saber.</h2>
          </div>
        </div>
        <div className={styles.faqList}>
          <details>
            <summary>Posso combinar sabores no mesmo kit?</summary>
            <p>
              Sim. Kits de 5 e 20 podem ser distribuídos livremente entre os três
              sabores disponíveis.
            </p>
          </details>
          <details>
            <summary>O Kit 20 é uma assinatura?</summary>
            <p>
              Não. Ele é uma compra avulsa, sem renovação automática. Assinaturas
              possuem contratação própria e serão apresentadas separadamente.
            </p>
          </details>
          <details>
            <summary>Como funcionam preparo, validade e conservação?</summary>
            <p>
              Cada refeição acompanha no rótulo as orientações específicas de
              preparo, validade e conservação. Elas vão do freezer ao micro-ondas
              e ficam prontas em poucos minutos.
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
        </div>
      </section>

      <section className={styles.finalCta} aria-labelledby="final-title">
        <div>
          <span>Linha Rotina · Corta Essa!</span>
          <h2 id="final-title">Comida memorável também cabe na terça-feira.</h2>
          <p>Escolha seus sabores e deixe a próxima semana mais gostosa.</p>
        </div>
        <a href="#kits">
          Montar meu kit <ChevronRight aria-hidden="true" />
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
            <strong>Alta gastronomia vegetal, da celebração ao dia a dia.</strong>
          </div>
          <nav aria-label="Navegação do rodapé">
            <span>Navegue</span>
            <Link href="/">Cardápio Brasa</Link>
            <a href="#sabores">Linha Rotina</a>
            <Link href="/clube">Clube Corta Essa!</Link>
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
