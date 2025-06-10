
import React, { useState } from 'react';
import FormHeader from '../components/FormHeader';
import { 
  Users, 
  Target, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  X,
  Plus,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

const Audience = () => {
  const [formTitle, setFormTitle] = useState('بدون عنوان');
  const [expandedSections, setExpandedSections] = useState({
    demographics: true,
    geographic: false
  });
  const [selectedCriteria, setSelectedCriteria] = useState({
    age: false,
    gender: false,
    maritalStatus: true,
    languagesSpoken: true,
    parentalStatus: true,
    numberOfChildren: false,
    ageGenderChildren: false,
    petsInHousehold: true,
    typeOfHome: true,
    deviceType: true,
    deviceOS: true,
    householdIncome: false,
    education: false,
    householdIncomeLevel: false,
    ukRegion: false,
    ukCity: false
  });

  const [selectedDevices, setSelectedDevices] = useState(['Mobile', 'Desktop']);
  const [searchTerms, setSearchTerms] = useState({
    languagesSpoken: '',
    parentalStatus: '',
    deviceType: '',
    deviceOS: ''
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleCriteria = (criteria: string) => {
    setSelectedCriteria(prev => ({
      ...prev,
      [criteria]: !prev[criteria]
    }));
  };

  const removeDevice = (device: string) => {
    setSelectedDevices(prev => prev.filter(d => d !== device));
  };

  const CriteriaSection = ({ title, isExpanded, onToggle, children }) => (
    <div className="border border-gray-200 rounded-lg mb-4">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg transition-colors"
      >
        <h3 className="font-medium text-gray-900">{title}</h3>
        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>
      {isExpanded && (
        <div className="p-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  );

  const CriteriaItem = ({ label, checked, onChange, hasInfo = false }) => (
    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
      <div className="flex items-center space-x-3 space-x-reverse">
        <Checkbox
          checked={checked}
          onCheckedChange={onChange}
        />
        <span className="text-sm text-gray-700">{label}</span>
        {hasInfo && <span className="text-blue-500">ⓘ</span>}
      </div>
      {checked && <X className="w-4 h-4 text-gray-400 cursor-pointer" />}
    </div>
  );

  const FilterPanel = ({ title, searchValue, onSearchChange, hasQuotas = true }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <X className="w-4 h-4 text-gray-400 cursor-pointer" />
      </div>
      
      <div className="space-y-3">
        <div className="flex space-x-2 space-x-reverse">
          <Button variant="outline" size="sm" className="text-xs">Quotas</Button>
          <Button variant="outline" size="sm" className="text-xs">Exclude selected options</Button>
          <Button variant="outline" size="sm" className="text-xs">
            <Plus className="w-3 h-3 ml-1" />
            Create Group
          </Button>
        </div>
        
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search options"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {hasQuotas && (
          <div className="flex space-x-2 space-x-reverse">
            <Button variant="outline" size="sm" className="text-xs">Quotas</Button>
            <Button variant="outline" size="sm" className="text-xs">Exclude selected options</Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Plus className="w-3 h-3 ml-1" />
              Create Group
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col font-['Vazirmatn']" dir="rtl">
      <FormHeader formTitle={formTitle} setFormTitle={setFormTitle} />
      
      <div className="flex-1 flex">
        {/* Left Sidebar - Targeting Criteria */}
        <div className="w-96 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">TARGETING CRITERIA</h2>
            <div className="flex items-center space-x-2 space-x-reverse mb-4">
              <Button variant="outline" size="sm">Quotas</Button>
              <Button variant="outline" size="sm">Exclude selected options</Button>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 ml-1" />
                Create Group
              </Button>
            </div>
            
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search criteria" className="pl-10" />
            </div>
          </div>

          {/* Demographics Section */}
          <CriteriaSection
            title="Demographics"
            isExpanded={expandedSections.demographics}
            onToggle={() => toggleSection('demographics')}
          >
            <div className="space-y-1">
              <CriteriaItem
                label="Age"
                checked={selectedCriteria.age}
                onChange={() => toggleCriteria('age')}
                hasInfo={true}
              />
              <CriteriaItem
                label="Gender"
                checked={selectedCriteria.gender}
                onChange={() => toggleCriteria('gender')}
                hasInfo={true}
              />
              <CriteriaItem
                label="Marital Status"
                checked={selectedCriteria.maritalStatus}
                onChange={() => toggleCriteria('maritalStatus')}
              />
              <CriteriaItem
                label="Languages Spoken"
                checked={selectedCriteria.languagesSpoken}
                onChange={() => toggleCriteria('languagesSpoken')}
                hasInfo={true}
              />
              <CriteriaItem
                label="Parental Status / Pregnancy Status"
                checked={selectedCriteria.parentalStatus}
                onChange={() => toggleCriteria('parentalStatus')}
                hasInfo={true}
              />
              <CriteriaItem
                label="Number of Children in Household"
                checked={selectedCriteria.numberOfChildren}
                onChange={() => toggleCriteria('numberOfChildren')}
              />
              <CriteriaItem
                label="Age & Gender of Child(ren) in Household"
                checked={selectedCriteria.ageGenderChildren}
                onChange={() => toggleCriteria('ageGenderChildren')}
                hasInfo={true}
              />
              <CriteriaItem
                label="Pets in Household"
                checked={selectedCriteria.petsInHousehold}
                onChange={() => toggleCriteria('petsInHousehold')}
              />
              <CriteriaItem
                label="Type of Home"
                checked={selectedCriteria.typeOfHome}
                onChange={() => toggleCriteria('typeOfHome')}
              />
              <CriteriaItem
                label="Device Type"
                checked={selectedCriteria.deviceType}
                onChange={() => toggleCriteria('deviceType')}
              />
              <CriteriaItem
                label="Device Operating System (OS)"
                checked={selectedCriteria.deviceOS}
                onChange={() => toggleCriteria('deviceOS')}
              />
              <CriteriaItem
                label="Household Income UK"
                checked={selectedCriteria.householdIncome}
                onChange={() => toggleCriteria('householdIncome')}
                hasInfo={true}
              />
              <CriteriaItem
                label="Education"
                checked={selectedCriteria.education}
                onChange={() => toggleCriteria('education')}
                hasInfo={true}
              />
              <CriteriaItem
                label="Household Income Level"
                checked={selectedCriteria.householdIncomeLevel}
                onChange={() => toggleCriteria('householdIncomeLevel')}
              />
            </div>
          </CriteriaSection>

          {/* Geographic Criteria Section */}
          <CriteriaSection
            title="Geographic Criteria"
            isExpanded={expandedSections.geographic}
            onToggle={() => toggleSection('geographic')}
          >
            <div className="space-y-1">
              <CriteriaItem
                label="UK Region"
                checked={selectedCriteria.ukRegion}
                onChange={() => toggleCriteria('ukRegion')}
                hasInfo={true}
              />
              <CriteriaItem
                label="UK City"
                checked={selectedCriteria.ukCity}
                onChange={() => toggleCriteria('ukCity')}
              />
            </div>
          </CriteriaSection>

          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Completes:</span>
              <span className="font-semibold">800</span>
            </div>
            <div className="mt-2">
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                Feasible
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 space-y-4">
          {/* Languages Spoken Filter */}
          {selectedCriteria.languagesSpoken && (
            <FilterPanel
              title="Languages Spoken"
              searchValue={searchTerms.languagesSpoken}
              onSearchChange={(value) => setSearchTerms(prev => ({ ...prev, languagesSpoken: value }))}
            />
          )}

          {/* Parental Status Filter */}
          {selectedCriteria.parentalStatus && (
            <FilterPanel
              title="Parental Status / Pregnancy Status"
              searchValue={searchTerms.parentalStatus}
              onSearchChange={(value) => setSearchTerms(prev => ({ ...prev, parentalStatus: value }))}
            />
          )}

          {/* Device Type Filter */}
          {selectedCriteria.deviceType && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Device Type</h4>
                <X className="w-4 h-4 text-gray-400 cursor-pointer" />
              </div>
              
              <div className="space-y-3">
                <div className="flex space-x-2 space-x-reverse mb-3">
                  {selectedDevices.map((device) => (
                    <Badge key={device} variant="secondary" className="flex items-center space-x-1 space-x-reverse">
                      <span>{device}</span>
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => removeDevice(device)}
                      />
                    </Badge>
                  ))}
                </div>
                
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search options"
                    value={searchTerms.deviceType}
                    onChange={(e) => setSearchTerms(prev => ({ ...prev, deviceType: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex space-x-2 space-x-reverse">
                  <Button variant="outline" size="sm" className="text-xs">Quotas</Button>
                  <Button variant="outline" size="sm" className="text-xs">Exclude selected options</Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Plus className="w-3 h-3 ml-1" />
                    Create Group
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Device Operating System Filter */}
          {selectedCriteria.deviceOS && (
            <FilterPanel
              title="Device Operating System (OS)"
              searchValue={searchTerms.deviceOS}
              onSearchChange={(value) => setSearchTerms(prev => ({ ...prev, deviceOS: value }))}
            />
          )}

          {/* Additional Criteria Tags */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="flex items-center space-x-1 space-x-reverse">
                <span>Type of Home</span>
                <X className="w-3 h-3 cursor-pointer" />
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1 space-x-reverse">
                <span>Age</span>
                <X className="w-3 h-3 cursor-pointer" />
              </Badge>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Summary */}
        <div className="w-80 bg-white border-r border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Audience 1</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Completes:</span>
                <span className="font-semibold">800</span>
              </div>
              <div>
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  Feasible
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Total cost:</span>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className="font-semibold">$6,560.00 (USD)</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
              <div className="flex space-x-2 space-x-reverse">
                <Button variant="outline" size="sm">Preview survey</Button>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  Checkout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Audience;
