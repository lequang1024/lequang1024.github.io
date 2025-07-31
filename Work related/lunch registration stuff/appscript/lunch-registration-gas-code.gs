/**
 * Google Apps Script Server-side Code (Code.gs)
 * Copy this entire content to your Code.gs file in Google Apps Script
 */

// Configuration
const SHEET_ID = '1zNXFDcMMZTPIhchSxiBWGaqqB8DnnJyqAbk1hdC2Q2o';
const SHEET_NAME = 'Phonebook & Lunch';
const SHEET_GID = 967403840;

/**
 * Serve the HTML interface
 */
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Lunch Registration Tool')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Include external files (for modular HTML)
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Get the target sheet
 */
function getTargetSheet() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  
  // Try to get the specific sheet by name first
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  // If not found by name, try by gid
  if (!sheet) {
    const sheets = spreadsheet.getSheets();
    for (let i = 0; i < sheets.length; i++) {
      const currentSheet = sheets[i];
      const currentSheetId = currentSheet.getSheetId();
      if (currentSheetId === SHEET_GID) {
        sheet = currentSheet;
        break;
      }
    }
  }
  
  // If still not found, try to find by content (look for VN codes)
  if (!sheet) {
    const sheets = spreadsheet.getSheets();
    for (let i = 0; i < sheets.length; i++) {
      const currentSheet = sheets[i];
      const data = currentSheet.getDataRange().getValues();
      
      // Check if this sheet contains lunch registration data
      for (let row of data) {
        if (row[0] && row[0].toString().startsWith('VN')) {
          sheet = currentSheet;
          break;
        }
      }
      if (sheet) break;
    }
  }
  
  // Fall back to active sheet if still not found
  if (!sheet) {
    sheet = spreadsheet.getActiveSheet();
  }
  
  return sheet;
}

/**
 * Load all sheet data
 */
function loadSheetData() {
  try {
    const sheet = getTargetSheet();
    const data = sheet.getDataRange().getValues();
    
    return {
      success: true,
      data: data,
      sheetName: sheet.getName(),
      sheetId: sheet.getSheetId()
    };
  } catch (error) {
    console.error('Error loading sheet data:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Parse employee data from sheet
 */
function getEmployeeData() {
  try {
    const result = loadSheetData();
    if (!result.success) {
      return result;
    }
    
    const sheetData = result.data;
    const employees = [];
    
    // Find the header row (contains "VN code", "Employee code", etc.)
    let headerRowIndex = -1;
    for (let i = 0; i < sheetData.length; i++) {
      if (sheetData[i][0] && sheetData[i][0].toString().includes('VN')) {
        headerRowIndex = i;
        break;
      }
    }
    
    if (headerRowIndex === -1) {
      return {
        success: false,
        error: 'Could not find employee data in the sheet'
      };
    }
    
    // Get menu from row 9 (index 8) - columns H, I, J, K, L (indices 7, 8, 9, 10, 11)
    const menuRow = sheetData[8] || []; // Row 9 is index 8
    const lunchMenus = {
      'Monday': menuRow[7] || 'Monday Menu',
      'Tuesday': menuRow[8] || 'Tuesday Menu', 
      'Wednesday': menuRow[9] || 'Wednesday Menu',
      'Thursday': menuRow[10] || 'Thursday Menu',
      'Friday': menuRow[11] || 'Friday Menu'
    };
    
    // Parse employee rows (starting after header)
    for (let i = headerRowIndex + 1; i < sheetData.length; i++) {
      const row = sheetData[i];
      if (row[0] && row[0].toString().startsWith('VN')) {
        employees.push({
          rowIndex: i,
          vnCode: row[0] || '',
          employeeCode: row[1] || '',
          fullName: row[2] || '',
          role: row[3] || '',
          nickname: row[4] || '',
          phone: row[5] || '',
          email: row[6] || '',     // Column G
          monday: row[7] || '',    // Column H
          tuesday: row[8] || '',   // Column I
          wednesday: row[9] || '', // Column J
          thursday: row[10] || '', // Column K
          friday: row[11] || ''    // Column L
        });
      }
    }
    
    return {
      success: true,
      employees: employees,
      lunchMenus: lunchMenus,
      sheetName: result.sheetName,
      sheetId: result.sheetId
    };
  } catch (error) {
    console.error('Error parsing employee data:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Update lunch registrations
 */
function updateLunchRegistrations(updates) {
  try {
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return {
        success: false,
        error: 'No updates provided'
      };
    }
    
    const sheet = getTargetSheet();
    
    // Apply all updates
    updates.forEach(update => {
      const range = update.range;
      const value = update.value;
      sheet.getRange(range).setValue(value);
    });
    
    return {
      success: true,
      message: `Updated ${updates.length} lunch registrations`,
      updatedCells: updates.length,
      sheetName: sheet.getName()
    };
  } catch (error) {
    console.error('Error updating registrations:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Get a specific employee's data by index
 */
function getEmployeeByIndex(employeeIndex) {
  try {
    const result = getEmployeeData();
    if (!result.success) {
      return result;
    }
    
    if (employeeIndex < 0 || employeeIndex >= result.employees.length) {
      return {
        success: false,
        error: 'Invalid employee index'
      };
    }
    
    return {
      success: true,
      employee: result.employees[employeeIndex]
    };
  } catch (error) {
    console.error('Error getting employee by index:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Search employees by name, nickname, or VN code
 */
function searchEmployees(searchTerm) {
  try {
    const result = getEmployeeData();
    if (!result.success) {
      return result;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const filteredEmployees = result.employees.filter(employee => {
      const searchableText = `${employee.fullName} ${employee.nickname} ${employee.vnCode} ${employee.role}`.toLowerCase();
      return searchableText.includes(searchLower);
    });
    
    return {
      success: true,
      employees: filteredEmployees,
      totalFound: filteredEmployees.length
    };
  } catch (error) {
    console.error('Error searching employees:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Get current Google user information
 */
function getCurrentUser() {
  try {
    const user = Session.getActiveUser();
    const email = user.getEmail();
    const name = user.getName || email.split('@')[0]; // Fallback to email prefix if name not available
    
    return {
      success: true,
      email: email,
      name: typeof name === 'function' ? name() : name,
      displayName: typeof name === 'function' ? name() : name
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return {
      success: false,
      error: error.toString(),
      email: '',
      name: '',
      displayName: ''
    };
  }
}

/**
 * Test function to verify sheet access
 */
function testSheetAccess() {
  try {
    const sheet = getTargetSheet();
    const range = sheet.getDataRange();
    const numRows = range.getNumRows();
    const numCols = range.getNumColumns();
    
    return {
      success: true,
      sheetName: sheet.getName(),
      sheetId: sheet.getSheetId(),
      rows: numRows,
      columns: numCols,
      message: 'Sheet access successful'
    };
  } catch (error) {
    console.error('Error testing sheet access:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}
