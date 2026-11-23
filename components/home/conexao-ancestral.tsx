import { getConexaoAncestralMedia } from "@/lib/conexao-ancestral-media";
import styles from "./conexao-ancestral.module.css";

export async function ConexaoAncestral() {
  const [logo, upperRight, lowerLeft, upperLeft, lowerRight, background] = await getConexaoAncestralMedia();

  return (
    <section
      id="conexao-ancestral"
      className={styles.section}
      aria-label="Conexão Ancestral"
      style={background ? { backgroundImage: `var(--ca-background-tint), url("${background}")` } : undefined}
    >
      <div className={`mh-wrap ${styles.layout}`}>
        <div className={styles.copy}>
          <img
            {...logo}
            className={styles.logo}
            width={194}
            height={75}
            loading="lazy"
          />
          <h2>Support Indigenous-led projects in the Amazon</h2>
          <p>
            Conexão Ancestral is a Brazilian nonprofit that works alongside Indigenous
            peoples and traditional communities. Each community sets its priorities,
            from access to drinking water to passing on its language and traditions.
          </p>
          <p>
            You can help provide water filters for Nawa families or support the Kuntanawa
            people as they build their cultural centre.
          </p>
          <a className={styles.link} href="https://www.conexaoancestral.org/projects">
            Choose a project to support
          </a>
        </div>
        <div className={styles.gallery}>
          <div className={styles.leftColumn}>
            <img {...upperLeft} width={480} height={640} loading="lazy" />
            <img {...lowerLeft} width={660} height={702} loading="lazy" />
          </div>
          <div className={styles.rightColumn}>
            <img {...upperRight} width={840} height={724} loading="lazy" />
            <img {...lowerRight} width={640} height={747} loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  );
}
