module.exports = {
    apps: [
      {
        name: "nextjs-app",
        script: "npm",
        args: "start",
        cwd: "/home/github-runner-ubuntu/actions-runner/_work/Administracion-Escuelas/Administracion-Escuelas",
        env: {
          DATABASE_URL: process.env.DATABASE_URL,
          NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
          JWT_SECRET: process.env.JWT_SECRET,
          NEXT_BUILD_WORKERS: "2",
        },
      },
    ],
  };
  