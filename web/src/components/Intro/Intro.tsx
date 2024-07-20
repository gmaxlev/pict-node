import Layout from "@theme/Layout";
import clsx from "clsx";
import styles from "./Intro.module.css";
import Link from "@docusaurus/Link";

export default function Intro() {
  return (
    <Layout
      title={`PICT for Node.js`}
      description="Description will go into a meta tag in <head />"
      wrapperClassName={clsx(styles.intro)}
    >
      <main className={"text--center"}>
        <div className={"container"}>
          <h1>PICT for Node.js</h1>
          <h2>Combinatorial Test Case Generation</h2>
          <p>
            Test suites made with pairwise testing check all possible pairs of
            factors, so they are much smaller than testing all possible
            combinations but are still very good at finding defects.
          </p>
          <Link
            to={"/docs/getting-started"}
            className={"button button--primary button--lg"}
          >
            Get Started
          </Link>
        </div>
      </main>
    </Layout>
  );
}
