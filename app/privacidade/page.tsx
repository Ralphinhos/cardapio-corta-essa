import type { Metadata } from "next";
import Link from "next/link";
import styles from "./privacidade.module.css";

export const metadata: Metadata = {
  title: "Privacidade e Cookies | Corta Essa!",
  description:
    "Saiba como a Corta Essa usa cookies e o Pixel da Meta para medir campanhas publicitárias.",
};

export default function PrivacyPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/">← Voltar ao cardápio</Link>
        <span>Corta Essa! · Privacidade</span>
      </header>
      <article className={styles.content}>
        <p className={styles.eyebrow}>Transparência em primeiro lugar</p>
        <h1>Privacidade e cookies</h1>
        <p className={styles.lead}>
          O cardápio e a página do Clube funcionam normalmente sem cookies de
          publicidade. O Pixel da Meta só é ativado quando você escolhe aceitar.
        </p>
        <section>
          <h2>O que é utilizado</h2>
          <p>
            Com sua autorização, carregamos o Pixel da Meta, identificado pelo
            código <strong>214378517891929</strong>. Essa tecnologia registra
            visitas às páginas para medir o desempenho de anúncios da Corta Essa
            no Facebook e no Instagram.
          </p>
        </section>
        <section>
          <h2>Quais informações podem ser tratadas</h2>
          <p>
            A Meta pode receber informações técnicas sobre o acesso, como a
            página visitada, horário, navegador, dispositivo e identificadores
            publicitários. Esses dados podem ser associados pela Meta às
            informações que ela já possui, conforme as políticas da plataforma.
          </p>
        </section>
        <section>
          <h2>Por quanto tempo</h2>
          <p>
            Os identificadores de navegador normalmente utilizados pelo Pixel,
            como <code>_fbp</code> e <code>_fbc</code>, podem permanecer por até
            90 dias, conforme a documentação da Meta. Sua escolha permanece no
            navegador até você alterá-la ou limpar os dados do site.
          </p>
        </section>
        <section>
          <h2>Como aceitar, recusar ou mudar de ideia</h2>
          <p>
            No primeiro acesso, você pode aceitar ou recusar. Depois, use o botão
            <strong> Cookies</strong> no canto inferior esquerdo para rever a
            escolha. Também é possível bloquear cookies no navegador.
          </p>
        </section>
        <section>
          <h2>Responsáveis e contato</h2>
          <p>
            A Corta Essa decide sobre o uso do Pixel neste site. A Meta Platforms
            fornece a tecnologia de publicidade. Dúvidas e solicitações podem
            ser encaminhadas pelos canais oficiais da Corta Essa.
          </p>
        </section>
        <p className={styles.updated}>Última atualização: 24 de julho de 2026.</p>
      </article>
    </main>
  );
}
