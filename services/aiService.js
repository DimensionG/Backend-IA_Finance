const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Respuestas predefinidas como respaldo
const backupResponses = {
  analysis: {
    noTransactions: `📊 **Análisis Financiero Básico**

Hola! Veo que estás comenzando con tu gestión financiera. Aquí tienes algunos consejos iniciales:

🔍 **Para empezar:**
1. Registra todos tus ingresos y gastos diariamente
2. Clasifica cada transacción en categorías específicas
3. Establece un presupuesto mensual realista

💡 **Próximos pasos:**
- Una vez tengas más datos, podré darte análisis más detallados
- Revisa tus gastos recurrentes (suscripciones, servicios, etc.)
- Identifica oportunidades de ahorro

¡Sigue registrando tus transacciones para obtener insights más personalizados!`,

    withTransactions: (totals, expensesByCategory, incomeByCategory) => {
      const balance = totals.balance || 0;
      const income = totals.income || 0;
      const expenses = totals.expenses || 0;
      
      let analysis = `📈 **Análisis de tus Finanzas**\n\n`;
      
      if (balance > 0) {
        analysis += `✅ **Excelente trabajo!** Tienes un balance positivo de $${balance.toFixed(2)}\n`;
      } else {
        analysis += `⚠️ **Atención:** Tu balance es negativo ($${Math.abs(balance).toFixed(2)}). Revisa tus gastos.\n`;
      }
      
      if (Object.keys(expensesByCategory).length > 0) {
        analysis += `\n📉 **Tus mayores gastos:**\n`;
        Object.entries(expensesByCategory)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .forEach(([category, amount]) => {
            analysis += `- ${category}: $${amount.toFixed(2)}\n`;
          });
      }
      
      analysis += `\n💡 **Recomendaciones:**\n`;
      analysis += `• Revisa tus gastos en categorías no esenciales\n`;
      analysis += `• Establece metas de ahorro mensuales\n`;
      analysis += `• Considera crear un fondo de emergencia\n`;
      
      return analysis;
    }
  },

  prediction: `🔮 **Predicción Financiera**

Basado en patrones comunes, aquí hay algunas proyecciones:

📅 **Próximo mes:**
• Gastos esenciales: Mantendrán tendencia similar
• Gastos variables: Dependerán de tus hábitos
• Oportunidades de ahorro: Revisa suscripciones no utilizadas

💡 **Consejos proactivos:**
1. Revisa tus gastos recurrentes mensuales
2. Planifica compras importantes con anticipación
3. Establece un monto objetivo de ahorro`,

  tips: `💡 **Consejos Financieros Prácticos**

1. **Regla 50/30/20:**
   • 50% para necesidades esenciales
   • 30% para gustos personales  
   • 20% para ahorro e inversión

2. **Fondo de emergencia:**
   • Objetivo: 3-6 meses de gastos
   • Comienza con un monto pequeño y constante

3. **Revisa suscripciones:**
   • Cancela servicios que no uses regularmente
   • Busca planes más económicos

4. **Planifica compras:**
   • Evita compras impulsivas
   • Investiga antes de compras grandes

¡Pequeños cambios generan grandes resultados a largo plazo! 🚀`
};

class AIService {
  // Análisis de gastos y recomendaciones con Groq
  static async analyzeSpending(transactions, financialSummary) {
    try {
      // Verificar si tenemos API key de Groq
      if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'tu_groq_api_key_aqui') {
        return this.getBackupAnalysis(transactions, financialSummary);
      }

      const prompt = this.createAnalysisPrompt(transactions, financialSummary);
      
      const response = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Eres un experto asesor financiero personal. Analiza los patrones de gastos e ingresos y proporciona recomendaciones prácticas y específicas para mejorar la salud financiera. Sé directo pero constructivo. Responde en español."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama3-8b-8192", // Modelo rápido y económico de Groq
        temperature: 0.7,
        max_tokens: 1024,
        stream: false
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error en análisis con Groq, usando respaldo:', error.message);
      return this.getBackupAnalysis(transactions, financialSummary);
    }
  }

  // Predicción de gastos futuros con Groq
  static async predictFutureSpending(transactions) {
    try {
      if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'tu_groq_api_key_aqui') {
        return backupResponses.prediction;
      }

      const prompt = this.createPredictionPrompt(transactions);
      
      const response = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Eres un predictor financiero. Analiza patrones históricos y predice gastos futuros basándote en datos pasados. Sé conservador en tus estimaciones. Responde en español."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama3-8b-8192",
        temperature: 0.5,
        max_tokens: 512,
        stream: false
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error en predicción con Groq, usando respaldo:', error.message);
      return backupResponses.prediction;
    }
  }

  // Consejos financieros con Groq
  static async getFinancialTips(totals) {
    try {
      if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'tu_groq_api_key_aqui') {
        return backupResponses.tips;
      }

      const prompt = `
Basándote en esta situación financiera:
- Balance actual: $${totals.balance || 0}
- Ingresos mensuales: $${totals.income || 0}
- Gastos mensuales: $${totals.expenses || 0}

Proporciona 3-5 consejos financieros prácticos y específicos para mejorar esta situación.
Enfócate en acciones concretas que pueda implementar inmediatamente.

Responde en español de manera clara y directa.
      `;

      const response = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Eres un coach financiero práctico. Das consejos específicos, accionables y fáciles de implementar. Responde en español."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama3-8b-8192",
        temperature: 0.7,
        max_tokens: 512,
        stream: false
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error generando consejos con Groq, usando respaldo:', error.message);
      return backupResponses.tips;
    }
  }

  // Análisis de respaldo (se mantiene igual)
  static getBackupAnalysis(transactions, financialSummary) {
    if (transactions.length === 0) {
      return backupResponses.analysis.noTransactions;
    }

    const expensesByCategory = {};
    const incomeByCategory = {};
    
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        expensesByCategory[transaction.category] = (expensesByCategory[transaction.category] || 0) + parseFloat(transaction.amount);
      } else {
        incomeByCategory[transaction.category] = (incomeByCategory[transaction.category] || 0) + parseFloat(transaction.amount);
      }
    });

    const totals = financialSummary?.totals || {
      income: 0,
      expenses: 0,
      balance: 0
    };

    return backupResponses.analysis.withTransactions(totals, expensesByCategory, incomeByCategory);
  }

  // Crear prompt para el análisis (se mantiene igual)
  static createAnalysisPrompt(transactions, financialSummary) {
    const lastMonthTransactions = transactions.slice(0, 30);
    
    const expensesByCategory = {};
    const incomeByCategory = {};
    
    lastMonthTransactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        expensesByCategory[transaction.category] = (expensesByCategory[transaction.category] || 0) + parseFloat(transaction.amount);
      } else {
        incomeByCategory[transaction.category] = (incomeByCategory[transaction.category] || 0) + parseFloat(transaction.amount);
      }
    });

    const totals = financialSummary?.totals || {
      income: 0,
      expenses: 0,
      balance: 0
    };

    return `
Analiza los siguientes datos financieros y proporciona recomendaciones específicas:

RESUMEN FINANCIERO:
- Ingresos totales: $${totals.income || 0}
- Gastos totales: $${totals.expenses || 0}
- Balance: $${totals.balance || 0}

GASTOS POR CATEGORÍA:
${Object.entries(expensesByCategory).length > 0 
  ? Object.entries(expensesByCategory).map(([category, amount]) => `- ${category}: $${amount}`).join('\n')
  : '- No hay gastos registrados'
}

INGRESOS POR CATEGORÍA:
${Object.entries(incomeByCategory).length > 0 
  ? Object.entries(incomeByCategory).map(([category, amount]) => `- ${category}: $${amount}`).join('\n')
  : '- No hay ingresos registrados'
}

ÚLTIMAS TRANSACCIONES (máximo 10):
${lastMonthTransactions.slice(0, 10).length > 0 
  ? lastMonthTransactions.slice(0, 10).map(t => 
      `- ${t.date}: ${t.description} - $${t.amount} (${t.category})`
    ).join('\n')
  : '- No hay transacciones recientes'
}

Por favor analiza:
1. Patrones de gasto problemáticos
2. Oportunidades de ahorro
3. Recomendaciones específicas para mejorar
4. Alertas si hay gastos excesivos en alguna categoría

Responde en español de manera clara y práctica.
    `;
  }

  static createPredictionPrompt(transactions) {
    const lastThreeMonths = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return transactionDate >= threeMonthsAgo;
    });

    return `
Basándote en estos datos históricos de los últimos 3 meses, predice los gastos probables para el próximo mes:

TRANSACCIONES HISTÓRICAS (últimos 3 meses):
${lastThreeMonths.length > 0 
  ? lastThreeMonths.map(t => 
      `- ${t.date}: ${t.type === 'expense' ? 'GASTO' : 'INGRESO'} - ${t.category}: $${t.amount}`
    ).join('\n')
  : 'No hay transacciones históricas suficientes para análisis'
}

Proporciona:
1. Estimación de gastos totales para el próximo mes
2. Categorías que probablemente tendrán mayor gasto
3. Recomendaciones para prepararse financieramente

Responde en español de manera concisa.
    `;
  }
}

module.exports = AIService;