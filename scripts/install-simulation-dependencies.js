/**
 * Script para instalar las dependencias necesarias para el sistema de simulación
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.cyan}=== Instalando dependencias para el sistema de simulación ===${colors.reset}\n`);

// Lista de dependencias principales
const dependencies = [
  'playwright',
  'playwright-extra',
  'puppeteer-extra-plugin-stealth',
  'random-useragent'
];

// Lista de dependencias de desarrollo
const devDependencies = [
  '@playwright/test',
  '@types/random-useragent'
];

try {
  // Instalar dependencias principales
  console.log(`${colors.yellow}Instalando dependencias principales...${colors.reset}`);
  execSync(`npm install ${dependencies.join(' ')}`, { stdio: 'inherit' });
  
  // Instalar dependencias de desarrollo
  console.log(`\n${colors.yellow}Instalando dependencias de desarrollo...${colors.reset}`);
  execSync(`npm install -D ${devDependencies.join(' ')}`, { stdio: 'inherit' });
  
  // Instalar navegadores de Playwright
  console.log(`\n${colors.yellow}Instalando navegadores de Playwright...${colors.reset}`);
  execSync('npx playwright install chromium', { stdio: 'inherit' });
  
  // Verificar si el directorio de simulación existe, si no, crearlo
  const simulationDir = path.join(__dirname, '..', 'src', 'app', 'infrastructure', 'simulation');
  const behaviorsDir = path.join(simulationDir, 'behaviors');
  const actionsDir = path.join(simulationDir, 'actions');
  
  if (!fs.existsSync(simulationDir)) {
    console.log(`\n${colors.yellow}Creando directorios para el sistema de simulación...${colors.reset}`);
    fs.mkdirSync(simulationDir, { recursive: true });
    fs.mkdirSync(behaviorsDir, { recursive: true });
    fs.mkdirSync(actionsDir, { recursive: true });
  }
  
  console.log(`\n${colors.bright}${colors.green}✓ Instalación completada con éxito${colors.reset}`);
  console.log(`\n${colors.cyan}Para usar el sistema de simulación, asegúrate de tener los siguientes archivos:${colors.reset}`);
  console.log(`  - src/app/infrastructure/simulation/behaviors/BehaviorProfile.ts`);
  console.log(`  - src/app/infrastructure/simulation/actions/ActionTypes.ts`);
  console.log(`  - src/app/application/services/SimulationService.ts`);
  console.log(`  - src/app/infrastructure/controllers/SimulationController.ts`);
  console.log(`  - src/app/infrastructure/routes/simulation-routes.ts`);
  
} catch (error) {
  console.error(`\n${colors.bright}${colors.red}✗ Error durante la instalación:${colors.reset}`, error.message);
  process.exit(1);
} 