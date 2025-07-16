import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Edit3, Trash2, CreditCard } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Member = Tables<'members'>;

interface MemberSearchDropdownProps {
  onMemberSelect: (member: Member) => void;
  onMemberDelete: (member: Member) => void;
  onMemberPayment?: (member: Member) => void;
}

const MemberSearchDropdown: React.FC<MemberSearchDropdownProps> = ({ 
  onMemberSelect, 
  onMemberDelete,
  onMemberPayment 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["member-search", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .ilike("name", `%${searchTerm}%`)
        .limit(8);
      
      if (error) throw error;
      return data || [];
    },
    enabled: searchTerm.length > 0,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHoveredIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    setHoveredIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || members.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHoveredIndex(prev => (prev < members.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHoveredIndex(prev => (prev > 0 ? prev - 1 : members.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (hoveredIndex >= 0 && hoveredIndex < members.length) {
          handleMemberSelect(members[hoveredIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHoveredIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleMemberSelect = (member: Member) => {
    onMemberSelect(member);
    setSearchTerm('');
    setIsOpen(false);
    setHoveredIndex(-1);
  };

  const handleDeleteClick = (e: React.MouseEvent, member: Member) => {
    e.stopPropagation();
    onMemberDelete(member);
  };

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 transition-colors group-focus-within:text-blue-500" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm && setIsOpen(true)}
          placeholder="Search members by name..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-gradient-to-r from-white to-gray-50 focus:from-blue-50 focus:to-white"
        />
        
        {/* Animated loading indicator */}
        {isLoading && searchTerm && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && searchTerm && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden backdrop-blur-sm">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full animation-delay-150"></div>
                <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full animation-delay-300"></div>
              </div>
              <span className="text-sm mt-2 block">Searching members...</span>
            </div>
          ) : members.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No members found matching "{searchTerm}"</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {members.map((member, index) => (
                <div
                  key={member.id}
                  className={`group relative p-3 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0 ${
                    index === hoveredIndex 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 transform scale-[1.02] z-10' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleMemberSelect(member)}
                  onMouseEnter={() => setHoveredIndex(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white transition-all duration-200 ${
                        index === hoveredIndex 
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg scale-110' 
                          : 'bg-gradient-to-br from-gray-400 to-gray-600'
                      }`}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {member.name}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span className="truncate">{member.email}</span>
                          {member.phone && (
                            <>
                              <span>•</span>
                              <span>{member.phone}</span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">
                          Joined {formatJoinDate(member.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMemberSelect(member);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit member"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {onMemberPayment && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMemberPayment(member);
                            setIsOpen(false);
                            setSearchTerm('');
                          }}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Process Payment"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDeleteClick(e, member)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Status indicator */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-200 ${
                    member.status === 'active' 
                      ? 'bg-green-500' 
                      : member.status === 'inactive' 
                      ? 'bg-red-500' 
                      : 'bg-yellow-500'
                  } ${index === hoveredIndex ? 'w-2 shadow-lg' : ''}`} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MemberSearchDropdown;