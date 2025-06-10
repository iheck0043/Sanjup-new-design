import React, { useState } from 'react';
import FormHeader from '../components/FormHeader';
import { 
  Users, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Plus,
  X,
  Settings,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface CriteriaOption {
  id: string;
  label: string;
  selected: boolean;
  hasArrow?: boolean;
}

interface CriteriaGroup {
  id: string;
  title: string;
  icon: string;
  expanded: boolean;
  options: CriteriaOption[];
  selectedCount: number;
}

const Audience = () => {
  const [formTitle, setFormTitle] = useState('بدون عنوان');
  const [searchTerm, setSearchTerm] = useState('');
  const [completes] = useState(800);
  const [quotasEnabled, setQuotasEnabled] = useState(false);
  const [excludeSelected, setExcludeSelected] = useState(false);

  const [criteriaGroups, setCriteriaGroups] = useState<CriteriaGroup[]>([
    {
      id: 'demographics',
      title: 'Demographics',
      icon: '👥',
      expanded: true,
      selectedCount: 6,
      options: [
        { id: 'age', label: 'Age', selected: false, hasArrow: true },
        { id: 'gender', label: 'Gender', selected: false, hasArrow: true },
        { id: 'marital', label: 'Marital Status', selected: true, hasArrow: true },
        { id: 'languages', label: 'Languages Spoken', selected: true, hasArrow: true },
        { id: 'parental', label: 'Parental Status / Pregnancy Status', selected: true, hasArrow: true },
        { id: 'children', label: 'Number of Children in Household', selected: false, hasArrow: true },
        { id: 'age_children', label: 'Age & Gender of Child(ren) in Household', selected: false, hasArrow: true },
        { id: 'pets', label: 'Pets in Household', selected: true, hasArrow: true },
        { id: 'home_type', label: 'Type of Home', selected: true, hasArrow: true },
        { id: 'device_type', label: 'Device Type', selected: true, hasArrow: true },
        { id: 'device_os', label: 'Device Operating System (OS)', selected: false, hasArrow: true },
        { id: 'income', label: 'Household income UK', selected: false, hasArrow: true },
        { id: 'education', label: 'Education', selected: false, hasArrow: true },
        { id: 'income_level', label: 'Household Income Level', selected: false, hasArrow: true }
      ]
    },
    {
      id: 'geographic',
      title: 'Geographic Criteria',
      icon: '🌍',
      expanded: false,
      selectedCount: 0,
      options: [
        { id: 'uk_region', label: 'UK Region', selected: false, hasArrow: true },
        { id: 'uk_city', label: 'UK City', selected: false, hasArrow: true },
        { id: 'standard_postal', label: 'STANDARD Postal Code GB', selected: false, hasArrow: true }
      ]
    }
  ]);

  const [activeModals, setActiveModals] = useState<string[]>([
    'languages_spoken',
    'parental_status',
    'device_type',
    'device_os'
  ]);

  const toggleGroup = (groupId: string) => {
    setCriteriaGroups(groups => 
      groups.map(group => 
        group.id === groupId 
          ? { ...group, expanded: !group.expanded }
          : group
      )
    );
  };

  const toggleOption = (groupId: string, optionId: string) => {
    setCriteriaGroups(groups => 
      groups.map(group => {
        if (group.id === groupId) {
          const newOptions = group.options.map(option =>
            option.id === optionId 
              ? { ...option, selected: !option.selected }
              : option
          );
          const selectedCount = newOptions.filter(opt => opt.selected).length;
          return { ...group, options: newOptions, selectedCount };
        }
        return group;
      })
    );
  };

  const closeModal = (modalId: string) => {
    setActiveModals(modals => modals.filter(id => id !== modalId));
  };

  const filteredGroups = criteriaGroups.map(group => ({
    ...group,
    options: group.options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => group.options.length > 0 || searchTerm === '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col font-['Vazirmatn']" dir="rtl">
      <FormHeader formTitle={formTitle} setFormTitle={setFormTitle} />
      
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Stats */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Completes:</span>
                  <span className="font-bold text-lg">{completes.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Saved</span>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">✓ Feasible</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Total cost: $6,560.00 (USD)</span>
                <Button className="bg-blue-600 hover:bg-blue-700">Preview survey</Button>
                <Button className="bg-purple-600 hover:bg-purple-700">Checkout</Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar - Criteria */}
            <div className="col-span-4">
              <div className="bg-white rounded-lg shadow-sm border">
                {/* Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-blue-600" />
                    <h2 className="font-semibold text-gray-900">TARGETING CRITERIA</h2>
                  </div>
                  
                  {/* Search */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search criteria"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Criteria Groups */}
                <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                  {filteredGroups.map((group) => (
                    <div key={group.id} className="border-b last:border-b-0">
                      <button
                        onClick={() => toggleGroup(group.id)}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{group.icon}</span>
                          <span className="font-medium text-gray-900">{group.title}</span>
                          {group.selectedCount > 0 && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              {group.selectedCount}
                            </Badge>
                          )}
                        </div>
                        {group.expanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                      </button>

                      {group.expanded && (
                        <div className="pb-2">
                          {group.options.map((option) => (
                            <div
                              key={option.id}
                              className="flex items-center justify-between py-2 px-4 hover:bg-gray-50 cursor-pointer"
                              onClick={() => toggleOption(group.id, option.id)}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                                  option.selected 
                                    ? 'bg-blue-600 border-blue-600 text-white' 
                                    : 'border-gray-300'
                                }`}>
                                  {option.selected && <Check className="w-3 h-3" />}
                                </div>
                                <span className="text-sm text-gray-700">{option.label}</span>
                              </div>
                              {option.hasArrow && (
                                <ChevronDown className="w-3 h-3 text-gray-400" />
                              )}
                            </div>
                          ))}

                          {group.id === 'demographics' && (
                            <div className="px-4 py-2 space-y-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full justify-start"
                              >
                                <Plus className="w-3 h-3 mr-2" />
                                Create Group
                              </Button>
                              
                              <div className="flex items-center justify-between py-1">
                                <span className="text-xs text-gray-600">Quotas</span>
                                <Switch 
                                  checked={quotasEnabled}
                                  onCheckedChange={setQuotasEnabled}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between py-1">
                                <span className="text-xs text-gray-600">Exclude selected options</span>
                                <Switch 
                                  checked={excludeSelected}
                                  onCheckedChange={setExcludeSelected}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Audience Info */}
              <div className="mt-4 bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-900">Audience 1</span>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-3 h-3" />
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  <div>Completes:</div>
                  <div className="font-bold text-lg">{completes}</div>
                </div>
                <div className="mt-2">
                  <Badge className="bg-green-100 text-green-700">Feasible</Badge>
                </div>
              </div>
            </div>

            {/* Right Content - Detail Modals */}
            <div className="col-span-8 space-y-4">
              {/* Languages Spoken Modal */}
              {activeModals.includes('languages_spoken') && (
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🗣️</span>
                      <h3 className="font-semibold">Languages Spoken</h3>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => closeModal('languages_spoken')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-4">
                    <Input placeholder="Search options" className="mb-4" />
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Switch />
                        <span>Quotas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch />
                        <span>Exclude selected options</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Plus className="w-3 h-3 mr-1" />
                        Create Group
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Device Type Modal */}
              {activeModals.includes('device_type') && (
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📱</span>
                      <h3 className="font-semibold">Device Type</h3>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => closeModal('device_type')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-4">
                    <div className="flex gap-2 mb-4">
                      <Badge className="bg-blue-100 text-blue-700">
                        Mobile
                        <Button variant="ghost" size="sm" className="ml-1 h-4 w-4 p-0">
                          <X className="w-2 h-2" />
                        </Button>
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-700">
                        Desktop
                        <Button variant="ghost" size="sm" className="ml-1 h-4 w-4 p-0">
                          <X className="w-2 h-2" />
                        </Button>
                      </Badge>
                    </div>
                    <Input placeholder="Search options" className="mb-4" />
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Switch />
                        <span>Quotas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch />
                        <span>Exclude selected options</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Plus className="w-3 h-3 mr-1" />
                        Create Group
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Device OS Modal */}
              {activeModals.includes('device_os') && (
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💻</span>
                      <h3 className="font-semibold">Device Operating System (OS)</h3>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => closeModal('device_os')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-4">
                    <Input placeholder="Search options" className="mb-4" />
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Switch />
                        <span>Quotas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch />
                        <span>Exclude selected options</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Plus className="w-3 h-3 mr-1" />
                        Create Group
                      </Button>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <span className="text-blue-600 cursor-pointer hover:underline">Type of Home</span>
                      <span className="text-blue-600 cursor-pointer hover:underline">Age</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Audience;
