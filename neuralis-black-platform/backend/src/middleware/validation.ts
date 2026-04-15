import { Request, Response, NextFunction } from 'express';

export interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'email' | 'array';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validate(rules: ValidationRule[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationError[] = [];
    const body = req.body;

    for (const rule of rules) {
      const value = body[rule.field];

      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push({ field: rule.field, message: `${rule.field} is required` });
        continue;
      }

      if (value === undefined || value === null) {
        continue;
      }

      switch (rule.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push({ field: rule.field, message: `${rule.field} must be a string` });
          } else {
            if (rule.minLength && value.length < rule.minLength) {
              errors.push({ field: rule.field, message: `${rule.field} must be at least ${rule.minLength} characters` });
            }
            if (rule.maxLength && value.length > rule.maxLength) {
              errors.push({ field: rule.field, message: `${rule.field} must be at most ${rule.maxLength} characters` });
            }
          }
          break;

        case 'number':
          if (typeof value !== 'number' || isNaN(value)) {
            errors.push({ field: rule.field, message: `${rule.field} must be a number` });
          } else {
            if (rule.min !== undefined && value < rule.min) {
              errors.push({ field: rule.field, message: `${rule.field} must be at least ${rule.min}` });
            }
            if (rule.max !== undefined && value > rule.max) {
              errors.push({ field: rule.field, message: `${rule.field} must be at most ${rule.max}` });
            }
          }
          break;

        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push({ field: rule.field, message: `${rule.field} must be a boolean` });
          }
          break;

        case 'email': {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (typeof value !== 'string' || !emailRegex.test(value)) {
            errors.push({ field: rule.field, message: `${rule.field} must be a valid email` });
          }
          break;
        }

        case 'array':
          if (!Array.isArray(value)) {
            errors.push({ field: rule.field, message: `${rule.field} must be an array` });
          }
          break;
      }
    }

    if (errors.length > 0) {
      res.status(400).json({ errors });
      return;
    }

    next();
  };
}
