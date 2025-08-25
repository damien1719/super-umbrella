/**
 * Utilitaire pour convertir le JSON du bilan (Lexical EditorState) en markdown lisible pour le LLM
 */

interface LexicalNode {
  type: string;
  children?: LexicalNode[];
  text?: string;
  slotId?: string;
  slotLabel?: string;
  slotType?: string;
  format?: number;
  version?: number;
  [key: string]: any;
}

interface LexicalRoot {
  root: LexicalNode;
  [key: string]: any;
}

/**
 * Convertit un nœud Lexical en markdown
 */
function nodeToMarkdown(node: LexicalNode, depth: number = 0): string {
  const indent = '  '.repeat(depth);
  
  switch (node.type) {
    case 'root':
      if (node.children) {
        return node.children.map(child => nodeToMarkdown(child, depth)).join('\n');
      }
      return '';
      
    case 'paragraph':
      if (node.children) {
        const content = node.children.map(child => nodeToMarkdown(child, depth + 1)).join('');
        return content ? `${indent}${content}\n` : '';
      }
      return '';
      
    case 'text':
      let text = node.text || '';
      
      // Appliquer le formatage
      if (node.format) {
        // Format est un bitfield, on vérifie chaque bit
        // Pour éviter les conflits, on n'applique qu'un seul format à la fois
        if (node.format & 8) {
          text = `\`${text}\``; // Code
        } else if (node.format & 4) {
          text = `~~${text}~~`; // Strikethrough
        } else if (node.format & 2) {
          text = `*${text}*`;   // Italic
        } else if (node.format & 1) {
          text = `**${text}**`; // Bold
        }
      }
      
      return text;
      
    case 'heading':
      const level = node.tag || 'h1';
      const headingLevel = level.replace('h', '');
      const headingSymbols = '#'.repeat(parseInt(headingLevel));
      
      if (node.children) {
        const content = node.children.map(child => nodeToMarkdown(child, depth + 1)).join('');
        return `${indent}${headingSymbols} ${content}\n`;
      }
      return '';
      
    case 'list':
      if (node.children) {
        return node.children.map(child => nodeToMarkdown(child, depth)).join('');
      }
      return '';
      
    case 'listitem':
      if (node.children) {
        const content = node.children.map(child => nodeToMarkdown(child, depth + 1)).join('');
        return `${indent}- ${content}\n`;
      }
      return '';
      
    case 'table':
      if (node.children) {
        return node.children.map(child => nodeToMarkdown(child, depth)).join('\n');
      }
      return '';
      
    case 'tablerow':
      if (node.children) {
        const cells = node.children.map(child => nodeToMarkdown(child, depth + 1)).join(' | ');
        return `${indent}| ${cells} |`;
      }
      return '';
      
    case 'tablecell':
      if (node.children) {
        const content = node.children.map(child => nodeToMarkdown(child, depth + 1)).join('');
        return content;
      }
      return '';
      
    case 'slot':
      // Rendu des slots avec leur contenu ou placeholder
      const slotLabel = node.slotLabel || node.slotId || 'Slot';
      const slotType = node.slotType || 'text';
      return `[${slotLabel} (${slotType})]`;
      
    case 'quote':
      if (node.children) {
        const content = node.children.map(child => nodeToMarkdown(child, depth + 1)).join('');
        return `${indent}> ${content}\n`;
      }
      return '';
      
    case 'link':
      if (node.children) {
        const content = node.children.map(child => nodeToMarkdown(child, depth + 1)).join('');
        const url = node.url || '#';
        return `[${content}](${url})`;
      }
      return '';
      
    default:
      // Pour les types non reconnus, essayer de traiter les enfants
      if (node.children) {
        return node.children.map(child => nodeToMarkdown(child, depth)).join('');
      }
      return '';
  }
}

/**
 * Convertit le JSON du bilan en markdown structuré
 */
export function bilanJsonToMarkdown(bilanJson: unknown): string {
  if (bilanJson === null || bilanJson === undefined) {
    return 'Aucun contenu disponible';
  }
  
  if (typeof bilanJson === 'string') {
    return bilanJson.trim() === '' ? 'Format de contenu non reconnu' : bilanJson;
  }
  
  if (typeof bilanJson !== 'object') {
    return 'Format de contenu non reconnu';
  }

  try {
    // Si c'est déjà un objet, l'utiliser directement
    const lexicalState = bilanJson as LexicalRoot;
    
    // Vérifier si c'est un état Lexical valide
    if (lexicalState.root && lexicalState.root.children && Array.isArray(lexicalState.root.children)) {
      return nodeToMarkdown(lexicalState.root);
    }
    
    // Si ce n'est pas un état Lexical, essayer de le traiter comme un objet simple
    if (typeof bilanJson === 'object' && bilanJson !== null) {
      return objectToMarkdown(bilanJson as Record<string, any>);
    }
    
    return 'Format de contenu non reconnu';
  } catch (error) {
    console.error('Erreur lors de la conversion JSON vers Markdown:', error);
    return 'Erreur lors de la conversion du contenu';
  }
}

/**
 * Convertit un objet simple en markdown (fallback)
 */
function objectToMarkdown(obj: Record<string, any>, depth: number = 0): string {
  const indent = '  '.repeat(depth);
  let result = '';
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    
    if (typeof value === 'object' && !Array.isArray(value)) {
      result += `${indent}## ${key}\n`;
      result += objectToMarkdown(value, depth + 1);
    } else if (Array.isArray(value)) {
      result += `${indent}**${key}:**\n`;
      for (const item of value) {
        if (typeof item === 'object' && item !== null) {
          result += objectToMarkdown(item, depth + 1);
        } else {
          result += `${indent}- ${String(item)}\n`;
        }
      }
    } else {
      result += `${indent}**${key}:** ${String(value)}\n`;
    }
  }
  
  return result;
}

/**
 * Convertit le JSON du bilan avec ses sections en markdown structuré
 */
export function bilanWithSectionsToMarkdown(bilan: any): string {
  if (!bilan) {
    return 'Aucun bilan disponible';
  }

  let markdown = '';
  
  // En-tête du bilan
  if (bilan.title) {
    markdown += `# ${bilan.title}\n\n`;
  }
  
  if (bilan.patient) {
    const patient = bilan.patient;
    if (patient.firstName || patient.lastName) {
      markdown += `**Patient:** ${patient.firstName || ''} ${patient.lastName || ''}\n\n`;
    }
  }
  
  if (bilan.date) {
    markdown += `**Date:** ${new Date(bilan.date).toLocaleDateString('fr-FR')}\n\n`;
  }
  
  // Contenu principal du bilan
  if (bilan.descriptionJson) {
    markdown += `## Contenu du bilan\n\n`;
    markdown += bilanJsonToMarkdown(bilan.descriptionJson);
    markdown += '\n\n';
  }
  
  // Sections du bilan
  if (bilan.sections && Array.isArray(bilan.sections)) {
    markdown += `## Sections détaillées\n\n`;
    
    // Trier les sections par ordre
    const sortedSections = [...bilan.sections].sort((a, b) => (a.order || 0) - (b.order || 0));
    
    for (const section of sortedSections) {
      if (section.section && section.section.title) {
        markdown += `### ${section.section.title}\n\n`;
      }
      
      if (section.contentNotes) {
        markdown += `**Notes:**\n`;
        markdown += objectToMarkdown(section.contentNotes, 1);
        markdown += '\n';
      }
      
      if (section.generatedContent) {
        markdown += `**Contenu généré:**\n`;
        markdown += bilanJsonToMarkdown(section.generatedContent);
        markdown += '\n';
      }
      
      if (section.test) {
        markdown += `**Test:** ${section.test}\n`;
      }
      
      markdown += '\n';
    }
  }
  
  // Si aucun contenu n'a été ajouté, retourner un message par défaut
  if (markdown.trim() === '') {
    return 'Aucun contenu disponible';
  }
  
  return markdown.trim();
}
